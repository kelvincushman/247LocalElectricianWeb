const { sendEmail } = require('../email');

module.exports = {
  name: 'send_email',
  description: 'Send an email from info@247electrician.uk via SMTP. Use for quotes, confirmations, certificates, and general correspondence.',
  inputSchema: {
    type: 'object',
    properties: {
      to: { type: 'string', description: 'Recipient email address' },
      subject: { type: 'string', description: 'Email subject line' },
      body: { type: 'string', description: 'Email body (plain text)' },
      html: { type: 'string', description: 'Email body (HTML, optional)' },
    },
    required: ['to', 'subject', 'body'],
  },
  handler: async (params, pool) => {
    const result = await sendEmail({
      to: params.to,
      subject: params.subject,
      text: params.body,
      html: params.html || undefined,
    });

    // Track in gateway_emails
    await pool.query(`
      INSERT INTO gateway_emails (direction, from_address, to_address, subject, body, message_id, status)
      VALUES ('outbound', $1, $2, $3, $4, $5, 'sent')
    `, [
      process.env.EMAIL_USER || 'info@247electrician.uk',
      params.to, params.subject, params.body, result.messageId,
    ]);

    return {
      success: true,
      message_id: result.messageId,
      to: params.to,
      subject: params.subject,
    };
  },
};
