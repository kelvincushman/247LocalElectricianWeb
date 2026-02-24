module.exports = {
  name: 'send_payment_link',
  description: 'Generate and send a Stripe payment link for an invoice.',
  inputSchema: {
    type: 'object',
    properties: {
      invoice_id: { type: 'string', description: 'Invoice UUID' },
      channel: { type: 'string', description: 'Channel to deliver link: whatsapp, sms, email' },
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

    if (outstanding <= 0) return { error: 'Invoice is fully paid' };

    // Check for existing active payment link
    const { rows: existingLinks } = await pool.query(
      `SELECT link_token FROM payment_links WHERE invoice_id = $1 AND status = 'active' AND expires_at > NOW() LIMIT 1`,
      [params.invoice_id]
    );

    let paymentUrl;
    if (existingLinks.length > 0) {
      paymentUrl = `https://www.247electrician.uk/api/pay/${existingLinks[0].link_token}`;
    } else {
      // Generate new payment link token
      const crypto = require('crypto');
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 7 * 86400000); // 7 days

      await pool.query(`
        INSERT INTO payment_links (invoice_id, link_token, amount, status, expires_at, created_at)
        VALUES ($1, $2, $3, 'active', $4, NOW())
      `, [params.invoice_id, token, outstanding, expiresAt]);

      paymentUrl = `https://www.247electrician.uk/api/pay/${token}`;
    }

    return {
      success: true,
      invoice_number: inv.invoice_number,
      amount: `£${outstanding.toFixed(2)}`,
      payment_url: paymentUrl,
      customer: `${inv.first_name} ${inv.last_name}`,
      message: `Hi ${inv.first_name}, here's your payment link for invoice ${inv.invoice_number} (£${outstanding.toFixed(2)}): ${paymentUrl} - 247Electrician`,
    };
  },
};
