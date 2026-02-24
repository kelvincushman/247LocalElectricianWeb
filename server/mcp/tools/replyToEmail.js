const { sendEmail } = require('../email');

module.exports = {
  name: 'reply_to_email',
  description: 'Reply to a specific email thread.',
  inputSchema: {
    type: 'object',
    properties: {
      to: { type: 'string', description: 'Recipient email address' },
      subject: { type: 'string', description: 'Reply subject (will add Re: if not present)' },
      body: { type: 'string', description: 'Reply body text' },
      in_reply_to: { type: 'string', description: 'Message-ID of the email being replied to' },
      original_message_id: { type: 'string', description: 'Message-ID for threading' },
    },
    required: ['to', 'subject', 'body'],
  },
  handler: async (params, pool) => {
    const subject = params.subject.startsWith('Re:') ? params.subject : `Re: ${params.subject}`;

    const result = await sendEmail({
      to: params.to,
      subject,
      text: params.body,
      inReplyTo: params.in_reply_to || params.original_message_id,
      references: params.original_message_id,
    });

    await pool.query(`
      INSERT INTO gateway_emails (direction, from_address, to_address, subject, body, message_id, in_reply_to, status)
      VALUES ('outbound', $1, $2, $3, $4, $5, $6, 'sent')
    `, [
      process.env.EMAIL_USER || 'info@247electrician.uk',
      params.to, subject, params.body, result.messageId,
      params.in_reply_to || params.original_message_id || null,
    ]);

    return {
      success: true,
      message_id: result.messageId,
      to: params.to,
      subject,
    };
  },
};
