module.exports = {
  name: 'route_email',
  description: 'Classify incoming email (enquiry/complaint/invoice query/certificate request) and suggest routing action.',
  inputSchema: {
    type: 'object',
    properties: {
      from_address: { type: 'string', description: 'Sender email address' },
      subject: { type: 'string', description: 'Email subject line' },
      body_preview: { type: 'string', description: 'First 500 chars of email body' },
      message_id: { type: 'string', description: 'Email Message-ID for tracking' },
    },
    required: ['from_address', 'subject'],
  },
  handler: async (params, pool) => {
    const subjectLower = (params.subject || '').toLowerCase();
    const bodyLower = (params.body_preview || '').toLowerCase();
    const combined = subjectLower + ' ' + bodyLower;

    // Simple keyword classification
    let classification = 'general_enquiry';
    let suggested_action = 'auto_reply';

    if (combined.match(/invoice|payment|pay|bill|receipt|outstanding|overdue/)) {
      classification = 'invoice_query';
      suggested_action = 'check_invoice_status';
    } else if (combined.match(/eicr|certificate|inspection|test|cert|landlord certificate/)) {
      classification = 'certificate_request';
      suggested_action = 'request_certificate';
    } else if (combined.match(/quote|estimate|price|cost|how much/)) {
      classification = 'quote_request';
      suggested_action = 'create_draft_quote';
    } else if (combined.match(/emergency|urgent|dangerous|spark|fire|shock|no power|power out/)) {
      classification = 'emergency';
      suggested_action = 'escalate_to_human';
    } else if (combined.match(/complaint|unhappy|dissatisfied|poor|terrible|disgusted/)) {
      classification = 'complaint';
      suggested_action = 'escalate_to_human';
    } else if (combined.match(/book|appointment|available|schedule|when can/)) {
      classification = 'booking_request';
      suggested_action = 'check_availability';
    } else if (combined.match(/cancel|reschedule|change date|move appointment/)) {
      classification = 'reschedule_request';
      suggested_action = 'lookup_job';
    }

    // Check if sender is existing customer
    const { rows: customers } = await pool.query(
      'SELECT id, first_name, last_name FROM customers WHERE email ILIKE $1 LIMIT 1',
      [params.from_address]
    );

    // Track in gateway_emails
    await pool.query(`
      INSERT INTO gateway_emails (direction, from_address, to_address, subject, body, message_id, classification, status)
      VALUES ('inbound', $1, $2, $3, $4, $5, $6, 'classified')
    `, [
      params.from_address,
      process.env.EMAIL_USER || 'info@247electrician.uk',
      params.subject, params.body_preview || '', params.message_id || null,
      classification,
    ]);

    return {
      classification,
      suggested_action,
      is_existing_customer: customers.length > 0,
      customer: customers.length > 0 ? {
        id: customers[0].id,
        name: `${customers[0].first_name} ${customers[0].last_name}`,
      } : null,
      from: params.from_address,
      subject: params.subject,
      priority: classification === 'emergency' || classification === 'complaint' ? 'high' : 'normal',
    };
  },
};
