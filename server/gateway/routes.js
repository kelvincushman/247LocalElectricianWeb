const express = require('express');

function createGatewayRoutes(pool, sessionSync, openclawClient) {
  const router = express.Router();

  // Dashboard stats
  router.get('/stats', async (req, res) => {
    try {
      const [sessions, messages, leads, overdue, expiring] = await Promise.all([
        pool.query(`SELECT
          COUNT(*) FILTER (WHERE status = 'active') AS active,
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') AS today,
          COUNT(*) AS total
          FROM gateway_sessions`),
        pool.query(`SELECT COUNT(*) AS total,
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') AS today
          FROM gateway_messages`),
        pool.query(`SELECT COUNT(*) FILTER (WHERE status = 'new') AS new_leads,
          COUNT(*) AS total FROM gateway_leads`),
        pool.query(`SELECT COUNT(*) AS count, COALESCE(SUM(total - COALESCE(amount_paid, 0)), 0) AS amount
          FROM invoices WHERE status NOT IN ('paid', 'cancelled', 'void') AND due_date < NOW()`),
        pool.query(`SELECT COUNT(*) AS count FROM certificates
          WHERE status = 'approved' AND next_inspection_date IS NOT NULL
          AND next_inspection_date <= NOW() + INTERVAL '3 months' AND next_inspection_date >= NOW() - INTERVAL '1 month'`),
      ]);

      res.json({
        sessions: sessions.rows[0],
        messages: messages.rows[0],
        leads: leads.rows[0],
        overdue_invoices: { count: parseInt(overdue.rows[0].count), amount: parseFloat(overdue.rows[0].amount).toFixed(2) },
        expiring_certificates: parseInt(expiring.rows[0].count),
        gateway_connected: openclawClient.connected,
      });
    } catch (err) {
      console.error('[Gateway Routes] Stats error:', err.message);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  });

  // List conversations
  router.get('/sessions', async (req, res) => {
    try {
      const { status, channel, page = 1, limit = 20 } = req.query;
      const result = await sessionSync.listSessions({ status, channel, page: parseInt(page), limit: parseInt(limit) });
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Conversation detail
  router.get('/sessions/:id', async (req, res) => {
    try {
      const session = await sessionSync.getSession(req.params.id);
      if (!session) return res.status(404).json({ error: 'Session not found' });
      const messages = await sessionSync.getSessionMessages(req.params.id);
      res.json({ session, messages });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Staff reply
  router.post('/sessions/:id/reply', async (req, res) => {
    try {
      const session = await sessionSync.getSession(req.params.id);
      if (!session) return res.status(404).json({ error: 'Session not found' });

      const { content } = req.body;
      if (!content) return res.status(400).json({ error: 'Content required' });

      // Store the staff message
      const msg = await sessionSync.syncMessage(req.params.id, {
        direction: 'outbound', sender_type: 'staff', content, content_type: 'text',
      });

      // Relay to OpenClaw
      openclawClient.sendReply(session.openclaw_session_id, content, session.channel_type);

      res.json({ success: true, message: msg });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Assign conversation
  router.post('/sessions/:id/assign', async (req, res) => {
    try {
      const { assigned_to } = req.body;
      await sessionSync.updateSessionStatus(req.params.id, 'assigned', assigned_to);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Close conversation
  router.post('/sessions/:id/close', async (req, res) => {
    try {
      await sessionSync.updateSessionStatus(req.params.id, 'closed');
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Channel list + status
  router.get('/channels', async (req, res) => {
    try {
      const channels = [
        { id: 'whatsapp', name: 'WhatsApp', type: 'whatsapp', status: openclawClient.connected ? 'connected' : 'disconnected' },
        { id: 'sms', name: 'SMS (Twilio)', type: 'sms', status: 'configured' },
        { id: 'email', name: 'Email', type: 'email', status: 'configured' },
        { id: 'webchat', name: 'WebChat', type: 'webchat', status: 'active' },
      ];
      res.json({ channels });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Reconnect channel
  router.post('/channels/:id/reconnect', async (req, res) => {
    try {
      if (req.params.id === 'whatsapp' || req.params.id === 'all') {
        openclawClient.disconnect();
        openclawClient.connect();
      }
      res.json({ success: true, message: 'Reconnection initiated' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Gateway leads
  router.get('/leads', async (req, res) => {
    try {
      const { status, page = 1, limit = 20 } = req.query;
      let query = `
        SELECT gl.*, gs.channel_type, c.first_name AS cust_first, c.last_name AS cust_last
        FROM gateway_leads gl
        LEFT JOIN gateway_sessions gs ON gl.session_id = gs.id
        LEFT JOIN customers c ON gl.customer_id = c.id
        WHERE 1=1
      `;
      const params = [];
      let idx = 1;
      if (status) { query += ` AND gl.status = $${idx++}`; params.push(status); }
      query += ` ORDER BY gl.created_at DESC LIMIT $${idx++} OFFSET $${idx}`;
      params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));
      const { rows } = await pool.query(query, params);
      const { rows: [{ count }] } = await pool.query(`SELECT COUNT(*) FROM gateway_leads${status ? ` WHERE status = '${status}'` : ''}`);
      res.json({ leads: rows, total: parseInt(count), page: parseInt(page) });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Update lead status
  router.put('/leads/:id', async (req, res) => {
    try {
      const { status } = req.body;
      await pool.query('UPDATE gateway_leads SET status = $1, updated_at = NOW() WHERE id = $2', [status, req.params.id]);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Analytics
  router.get('/analytics', async (req, res) => {
    try {
      const { days = 30 } = req.query;
      const { rows } = await pool.query(`
        SELECT * FROM gateway_analytics
        WHERE date >= NOW() - INTERVAL '${parseInt(days)} days'
        ORDER BY date DESC
      `);

      // Also get live counts
      const { rows: [live] } = await pool.query(`
        SELECT
          (SELECT COUNT(*) FROM gateway_sessions WHERE created_at >= NOW() - INTERVAL '${parseInt(days)} days') AS total_sessions,
          (SELECT COUNT(*) FROM gateway_messages WHERE created_at >= NOW() - INTERVAL '${parseInt(days)} days') AS total_messages,
          (SELECT COUNT(*) FROM gateway_leads WHERE created_at >= NOW() - INTERVAL '${parseInt(days)} days') AS total_leads
      `);

      res.json({ analytics: rows, live_stats: live });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Agent config
  router.get('/agent', async (req, res) => {
    try {
      const status = openclawClient.getStatus();
      res.json({
        connected: status.connected,
        url: status.url,
        model: 'anthropic/claude-sonnet-4-20250514',
        tools_count: 28,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Outbound message queue
  router.get('/outbound', async (req, res) => {
    try {
      const { status = 'pending', limit = 50 } = req.query;
      const { rows } = await pool.query(
        `SELECT * FROM gateway_outbound_queue WHERE status = $1 ORDER BY scheduled_for ASC LIMIT $2`,
        [status, parseInt(limit)]
      );
      res.json({ messages: rows });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Schedule outbound message
  router.post('/outbound', async (req, res) => {
    try {
      const { recipient_id, channel_type, message_type, content, scheduled_for } = req.body;
      const { rows: [msg] } = await pool.query(`
        INSERT INTO gateway_outbound_queue (recipient_id, channel_type, message_type, content, scheduled_for)
        VALUES ($1, $2, $3, $4, $5) RETURNING id
      `, [recipient_id, channel_type, message_type, content, scheduled_for || new Date().toISOString()]);
      res.json({ success: true, id: msg.id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Overdue invoices needing chase
  router.get('/invoices/overdue', async (req, res) => {
    try {
      const { rows } = await pool.query(`
        SELECT i.id, i.invoice_number, i.total, i.amount_paid, i.status, i.due_date,
               i.reminder_count, i.last_reminder_sent,
               c.first_name, c.last_name, c.phone, c.email,
               j.job_number, j.service_type
        FROM invoices i
        LEFT JOIN customers c ON i.customer_id = c.id
        LEFT JOIN jobs j ON i.job_id = j.id
        WHERE i.status NOT IN ('paid', 'cancelled', 'void') AND i.due_date < NOW()
        ORDER BY i.due_date ASC
      `);
      res.json({ invoices: rows, count: rows.length });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Trigger invoice chase
  router.post('/invoices/:id/chase', async (req, res) => {
    try {
      const { channel = 'email' } = req.body;
      const { rows: invoices } = await pool.query(`
        SELECT i.*, c.first_name, c.last_name, c.phone, c.email
        FROM invoices i LEFT JOIN customers c ON i.customer_id = c.id
        WHERE i.id = $1
      `, [req.params.id]);
      if (invoices.length === 0) return res.status(404).json({ error: 'Invoice not found' });

      const inv = invoices[0];
      const outstanding = parseFloat(inv.total || 0) - parseFloat(inv.amount_paid || 0);
      const reminderNum = (inv.reminder_count || 0) + 1;

      await pool.query(`
        INSERT INTO gateway_invoice_chasing (invoice_id, reminder_number, channel_used, message_sent)
        VALUES ($1, $2, $3, $4)
      `, [req.params.id, reminderNum, channel, `Payment reminder #${reminderNum} for £${outstanding.toFixed(2)}`]);

      await pool.query('UPDATE invoices SET reminder_count = $1, last_reminder_sent = NOW() WHERE id = $2', [reminderNum, req.params.id]);

      res.json({ success: true, reminder_number: reminderNum, outstanding: outstanding.toFixed(2) });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Expiring certificates
  router.get('/certificates/expiring', async (req, res) => {
    try {
      const { months = 3 } = req.query;
      const { rows } = await pool.query(`
        SELECT c.id, c.cert_type, c.cert_number, c.next_inspection_date,
               c.installation_address, c.installation_postcode,
               cu.id AS customer_id, cu.first_name, cu.last_name, cu.phone, cu.email
        FROM certificates c
        LEFT JOIN customers cu ON c.customer_id = cu.id
        WHERE c.status = 'approved'
          AND c.next_inspection_date IS NOT NULL
          AND c.next_inspection_date <= NOW() + INTERVAL '${parseInt(months)} months'
          AND c.next_inspection_date >= NOW() - INTERVAL '1 month'
        ORDER BY c.next_inspection_date ASC
      `);
      res.json({ certificates: rows, count: rows.length });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Recent email activity
  router.get('/emails', async (req, res) => {
    try {
      const { limit = 50 } = req.query;
      const { rows } = await pool.query(
        'SELECT * FROM gateway_emails ORDER BY created_at DESC LIMIT $1',
        [parseInt(limit)]
      );
      res.json({ emails: rows });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}

module.exports = createGatewayRoutes;
