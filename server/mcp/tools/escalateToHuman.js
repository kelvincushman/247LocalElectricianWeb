module.exports = {
  name: 'escalate_to_human',
  description: 'Flag a conversation for human staff attention. Sends notification to the portal.',
  inputSchema: {
    type: 'object',
    properties: {
      reason: { type: 'string', description: 'Why this needs human attention' },
      priority: { type: 'string', description: 'Priority: critical, high, normal' },
      customer_name: { type: 'string', description: 'Customer name' },
      customer_phone: { type: 'string', description: 'Customer phone' },
      channel: { type: 'string', description: 'Source channel' },
      conversation_summary: { type: 'string', description: 'Brief summary of the conversation so far' },
    },
    required: ['reason'],
  },
  handler: async (params, pool) => {
    // Queue an outbound notification for staff
    await pool.query(`
      INSERT INTO gateway_outbound_queue (recipient_id, channel_type, message_type, content, scheduled_for, status)
      VALUES ('staff', 'portal', 'escalation', $1, NOW(), 'pending')
    `, [JSON.stringify({
      reason: params.reason,
      priority: params.priority || 'normal',
      customer_name: params.customer_name,
      customer_phone: params.customer_phone,
      channel: params.channel,
      summary: params.conversation_summary,
    })]);

    return {
      success: true,
      escalated: true,
      priority: params.priority || 'normal',
      message: `This has been escalated to our team. ${params.priority === 'critical' ? 'For emergencies, please call 01902 943 929 immediately.' : 'A member of staff will follow up shortly.'}`,
    };
  },
};
