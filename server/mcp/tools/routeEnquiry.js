module.exports = {
  name: 'route_enquiry',
  description: 'Smart routing: emergency -> immediate callback, quote request -> create quote, existing customer -> link to account.',
  inputSchema: {
    type: 'object',
    properties: {
      enquiry_type: { type: 'string', description: 'Type: emergency, quote, booking, certificate, invoice, general' },
      customer_phone: { type: 'string', description: 'Customer phone number' },
      customer_email: { type: 'string', description: 'Customer email' },
      description: { type: 'string', description: 'Brief description of the enquiry' },
    },
    required: ['enquiry_type'],
  },
  handler: async (params, pool) => {
    // Try to match existing customer
    let customer = null;
    if (params.customer_phone) {
      const phone = params.customer_phone.replace(/\s+/g, '');
      const { rows } = await pool.query(
        `SELECT id, first_name, last_name, email FROM customers WHERE REPLACE(phone, ' ', '') ILIKE $1 OR REPLACE(COALESCE(phone_secondary, ''), ' ', '') ILIKE $1 LIMIT 1`,
        [`%${phone}%`]
      );
      if (rows.length > 0) customer = rows[0];
    }
    if (!customer && params.customer_email) {
      const { rows } = await pool.query('SELECT id, first_name, last_name FROM customers WHERE email ILIKE $1 LIMIT 1', [params.customer_email]);
      if (rows.length > 0) customer = rows[0];
    }

    const routes = {
      emergency: {
        action: 'escalate_to_human',
        priority: 'critical',
        message: 'Emergency flagged. Please call 01902 943 929 immediately. An electrician will be dispatched as soon as possible.',
        next_tools: ['escalate_to_human'],
      },
      quote: {
        action: 'create_draft_quote',
        priority: 'normal',
        message: 'Quote request received. We will prepare a detailed quote and send it to you shortly.',
        next_tools: customer ? ['create_draft_quote'] : ['capture_lead'],
      },
      booking: {
        action: 'check_availability',
        priority: 'normal',
        message: 'Booking request received. Let me check available appointment slots for you.',
        next_tools: ['check_availability', customer ? 'schedule_appointment' : 'capture_lead'],
      },
      certificate: {
        action: 'request_certificate',
        priority: 'normal',
        message: 'Certificate request received. We will arrange the inspection.',
        next_tools: customer ? ['request_certificate'] : ['capture_lead'],
      },
      invoice: {
        action: 'check_invoice_status',
        priority: 'normal',
        message: 'Invoice query received. Let me look up your account.',
        next_tools: customer ? ['check_invoice_status'] : ['lookup_customer'],
      },
      general: {
        action: 'get_services_info',
        priority: 'low',
        message: 'Thanks for your enquiry. How can we help?',
        next_tools: ['get_services_info', 'capture_lead'],
      },
    };

    const route = routes[params.enquiry_type] || routes.general;

    return {
      enquiry_type: params.enquiry_type,
      is_existing_customer: !!customer,
      customer: customer ? { id: customer.id, name: `${customer.first_name} ${customer.last_name}` } : null,
      routing: route,
    };
  },
};
