module.exports = {
  name: 'capture_lead',
  description: 'Capture a lead with contact info, service needed, urgency, and source channel.',
  inputSchema: {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'Contact name' },
      phone: { type: 'string', description: 'Phone number' },
      email: { type: 'string', description: 'Email address' },
      postcode: { type: 'string', description: 'Property postcode' },
      service_type: { type: 'string', description: 'Service needed' },
      description: { type: 'string', description: 'Description of work' },
      urgency: { type: 'string', description: 'Urgency: emergency, today, this_week, flexible' },
      source_channel: { type: 'string', description: 'Source: whatsapp, sms, email, webchat' },
    },
    required: ['name', 'phone'],
  },
  handler: async (params, pool) => {
    // Check if customer already exists
    const phone = params.phone.replace(/\s+/g, '');
    const { rows: existing } = await pool.query(
      `SELECT id, first_name, last_name FROM customers WHERE REPLACE(phone, ' ', '') ILIKE $1 OR REPLACE(COALESCE(phone_secondary, ''), ' ', '') ILIKE $1 LIMIT 1`,
      [`%${phone}%`]
    );

    const { rows: [lead] } = await pool.query(`
      INSERT INTO gateway_leads (customer_id, name, phone, email, postcode, service_type, description, urgency, source_channel, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'new')
      RETURNING id
    `, [
      existing.length > 0 ? existing[0].id : null,
      params.name, params.phone, params.email || null, params.postcode || null,
      params.service_type || null, params.description || null,
      params.urgency || 'flexible', params.source_channel || 'unknown',
    ]);

    return {
      success: true,
      lead_id: lead.id,
      is_existing_customer: existing.length > 0,
      customer: existing.length > 0 ? { id: existing[0].id, name: `${existing[0].first_name} ${existing[0].last_name}` } : null,
      message: `Lead captured for ${params.name} (${params.phone})${params.urgency === 'emergency' ? ' - URGENT: For emergencies, always call 01902 943 929 directly' : ''}. Our team will be in touch shortly.`,
    };
  },
};
