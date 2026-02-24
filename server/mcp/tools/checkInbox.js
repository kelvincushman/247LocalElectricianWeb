const { fetchInbox } = require('../email');

module.exports = {
  name: 'check_inbox',
  description: 'Check IMAP inbox for new/unread emails. Returns summary of messages.',
  inputSchema: {
    type: 'object',
    properties: {
      limit: { type: 'number', description: 'Max emails to fetch (default 20)' },
      unseen_only: { type: 'boolean', description: 'Only fetch unread emails (default true)' },
    },
  },
  handler: async (params, pool) => {
    const messages = await fetchInbox({
      limit: params.limit || 20,
      unseen: params.unseen_only !== false,
    });

    return {
      count: messages.length,
      emails: messages.map(m => ({
        uid: m.uid,
        from: m.from,
        from_address: m.fromAddress,
        subject: m.subject,
        date: m.date,
        message_id: m.messageId,
        in_reply_to: m.inReplyTo,
      })),
    };
  },
};
