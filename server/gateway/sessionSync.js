class SessionSync {
  constructor(pool) {
    this.pool = pool;
  }

  async syncSession(sessionData) {
    const { session_id, channel_type, sender_id, sender_name, context } = sessionData;

    // Try to match sender to existing customer
    let customerId = null;
    if (sender_id) {
      const phone = sender_id.replace(/\D/g, '');
      if (phone.length >= 10) {
        const { rows } = await this.pool.query(
          `SELECT id FROM customers WHERE REPLACE(phone, ' ', '') LIKE $1 OR REPLACE(mobile, ' ', '') LIKE $1 LIMIT 1`,
          [`%${phone.slice(-10)}%`]
        );
        if (rows.length > 0) customerId = rows[0].id;
      }
    }

    const { rows } = await this.pool.query(`
      INSERT INTO gateway_sessions (openclaw_session_id, channel_type, sender_id, sender_name, customer_id, context, last_message_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      ON CONFLICT (openclaw_session_id) DO UPDATE SET
        sender_name = COALESCE(EXCLUDED.sender_name, gateway_sessions.sender_name),
        customer_id = COALESCE(EXCLUDED.customer_id, gateway_sessions.customer_id),
        context = COALESCE(EXCLUDED.context, gateway_sessions.context),
        last_message_at = NOW(),
        updated_at = NOW()
      RETURNING id
    `, [session_id, channel_type, sender_id, sender_name || null, customerId, JSON.stringify(context || {})]);

    return rows[0].id;
  }

  async syncMessage(portalSessionId, messageData) {
    const {
      direction, sender_type, content, content_type,
      media_url, tool_calls, tokens_used, model_used,
    } = messageData;

    const { rows } = await this.pool.query(`
      INSERT INTO gateway_messages (session_id, direction, sender_type, content, content_type, media_url, tool_calls, tokens_used, model_used)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, created_at
    `, [
      portalSessionId, direction, sender_type, content,
      content_type || 'text', media_url || null,
      tool_calls ? JSON.stringify(tool_calls) : null,
      tokens_used || null, model_used || null,
    ]);

    // Update session last_message_at
    await this.pool.query(
      'UPDATE gateway_sessions SET last_message_at = NOW(), updated_at = NOW() WHERE id = $1',
      [portalSessionId]
    );

    return rows[0];
  }

  async getSession(sessionId) {
    const { rows } = await this.pool.query(`
      SELECT gs.*, c.first_name, c.last_name, c.phone, c.email
      FROM gateway_sessions gs
      LEFT JOIN customers c ON gs.customer_id = c.id
      WHERE gs.id = $1
    `, [sessionId]);
    return rows[0] || null;
  }

  async getSessionMessages(sessionId, limit = 100) {
    const { rows } = await this.pool.query(`
      SELECT * FROM gateway_messages
      WHERE session_id = $1
      ORDER BY created_at ASC
      LIMIT $2
    `, [sessionId, limit]);
    return rows;
  }

  async listSessions({ status, channel, page = 1, limit = 20 } = {}) {
    let query = `
      SELECT gs.*, c.first_name, c.last_name, c.phone, c.email,
        (SELECT COUNT(*) FROM gateway_messages WHERE session_id = gs.id) AS message_count,
        (SELECT content FROM gateway_messages WHERE session_id = gs.id ORDER BY created_at DESC LIMIT 1) AS last_message
      FROM gateway_sessions gs
      LEFT JOIN customers c ON gs.customer_id = c.id
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;

    if (status) { query += ` AND gs.status = $${idx++}`; params.push(status); }
    if (channel) { query += ` AND gs.channel_type = $${idx++}`; params.push(channel); }

    query += ` ORDER BY gs.last_message_at DESC LIMIT $${idx++} OFFSET $${idx}`;
    params.push(limit, (page - 1) * limit);

    const { rows } = await this.pool.query(query, params);

    let countQuery = 'SELECT COUNT(*) FROM gateway_sessions WHERE 1=1';
    const countParams = [];
    let countIdx = 1;
    if (status) { countQuery += ` AND status = $${countIdx++}`; countParams.push(status); }
    if (channel) { countQuery += ` AND channel_type = $${countIdx++}`; countParams.push(channel); }
    const { rows: [{ count }] } = await this.pool.query(countQuery, countParams);

    return { sessions: rows, total: parseInt(count), page, limit };
  }

  async updateSessionStatus(sessionId, status, assignedTo) {
    const updates = ['status = $2', 'updated_at = NOW()'];
    const params = [sessionId, status];
    if (assignedTo !== undefined) {
      updates.push(`assigned_to = $3`);
      params.push(assignedTo);
    }
    await this.pool.query(
      `UPDATE gateway_sessions SET ${updates.join(', ')} WHERE id = $1`,
      params
    );
  }
}

module.exports = SessionSync;
