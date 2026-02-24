module.exports = {
  name: 'send_payment_reminder',
  description: 'Send a payment reminder for an overdue invoice via the preferred channel (WhatsApp/SMS/Email).',
  inputSchema: {
    type: 'object',
    properties: {
      invoice_id: { type: 'string', description: 'Invoice UUID' },
      channel: { type: 'string', description: 'Channel to use: whatsapp, sms, email. Defaults to email.' },
      message: { type: 'string', description: 'Custom reminder message (optional - auto-generated if not provided)' },
    },
    required: ['invoice_id'],
  },
  handler: async (params, pool) => {
    const { rows: invoices } = await pool.query(`
      SELECT i.*, c.first_name, c.last_name, c.phone, c.email
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      WHERE i.id = $1
    `, [params.invoice_id]);

    if (invoices.length === 0) return { error: 'Invoice not found' };
    const inv = invoices[0];
    const outstanding = parseFloat(inv.total || 0) - parseFloat(inv.amount_paid || 0);

    if (outstanding <= 0) return { error: 'Invoice is fully paid', invoice_number: inv.invoice_number };

    const daysOverdue = inv.due_date ? Math.ceil((Date.now() - new Date(inv.due_date)) / 86400000) : 0;
    const reminderNum = (inv.reminder_count || 0) + 1;

    const message = params.message || generateReminderMessage(inv, outstanding, daysOverdue, reminderNum);

    // Record the chase
    await pool.query(`
      INSERT INTO gateway_invoice_chasing (invoice_id, reminder_number, channel_used, message_sent)
      VALUES ($1, $2, $3, $4)
    `, [params.invoice_id, reminderNum, params.channel || 'email', message]);

    // Update invoice reminder count
    await pool.query(`
      UPDATE invoices SET reminder_count = $1, last_reminder_sent = NOW() WHERE id = $2
    `, [reminderNum, params.invoice_id]);

    return {
      success: true,
      invoice_number: inv.invoice_number,
      customer: `${inv.first_name} ${inv.last_name}`,
      outstanding: `£${outstanding.toFixed(2)}`,
      reminder_number: reminderNum,
      channel: params.channel || 'email',
      message_preview: message.substring(0, 200) + (message.length > 200 ? '...' : ''),
      note: 'Message queued for delivery via the gateway channel',
    };
  },
};

function generateReminderMessage(inv, outstanding, daysOverdue, reminderNum) {
  const name = inv.first_name || 'Customer';
  if (reminderNum <= 1) {
    return `Hi ${name}, this is a friendly reminder that invoice ${inv.invoice_number} for £${outstanding.toFixed(2)} is ${daysOverdue > 0 ? `${daysOverdue} days overdue` : 'now due'}. Please arrange payment at your earliest convenience. If you've already paid, please disregard this message. Thanks, 247Electrician`;
  } else if (reminderNum <= 2) {
    return `Hi ${name}, we notice invoice ${inv.invoice_number} for £${outstanding.toFixed(2)} remains unpaid (${daysOverdue} days overdue). Please arrange payment as soon as possible. We can send you a payment link for easy card payment. Thanks, 247Electrician`;
  } else {
    return `Dear ${name}, invoice ${inv.invoice_number} for £${outstanding.toFixed(2)} is now ${daysOverdue} days overdue. Please contact us urgently to arrange payment or discuss any issues. Call 01902 943 929. 247Electrician`;
  }
}
