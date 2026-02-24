module.exports = {
  name: 'get_certificate_due_dates',
  description: 'Find certificates expiring soon (EICR every 5 years, landlord every 5 years). Used for proactive renewal reminders.',
  inputSchema: {
    type: 'object',
    properties: {
      months_ahead: { type: 'number', description: 'Look ahead period in months (default 3)' },
      certificate_type: { type: 'string', description: 'Filter by type: EICR, EICS, etc.' },
    },
  },
  handler: async (params, pool) => {
    const monthsAhead = params.months_ahead || 3;

    let query = `
      SELECT c.id, c.certificate_type, c.certificate_no, c.status,
             c.next_inspection_date, c.inspection_date, c.created_at,
             c.installation_address, c.installation_postcode,
             cu.id AS customer_id, cu.first_name, cu.last_name, cu.phone, cu.email
      FROM certificates c
      LEFT JOIN customers cu ON c.customer_id = cu.id
      WHERE c.status = 'approved'
        AND c.next_inspection_date IS NOT NULL
        AND c.next_inspection_date <= NOW() + INTERVAL '${parseInt(monthsAhead)} months'
        AND c.next_inspection_date >= NOW() - INTERVAL '1 month'
    `;
    const queryParams = [];

    if (params.certificate_type) {
      query += ' AND c.certificate_type = $1';
      queryParams.push(params.certificate_type);
    }

    query += ' ORDER BY c.next_inspection_date ASC';

    const { rows } = await pool.query(query, queryParams);

    // Check which already have reminders sent
    const certIds = rows.map(r => r.id);
    let reminderMap = {};
    if (certIds.length > 0) {
      const { rows: reminders } = await pool.query(
        'SELECT certificate_id, MAX(sent_at) AS last_reminded FROM gateway_certificate_reminders WHERE certificate_id = ANY($1) GROUP BY certificate_id',
        [certIds]
      );
      reminderMap = Object.fromEntries(reminders.map(r => [r.certificate_id, r.last_reminded]));
    }

    return {
      count: rows.length,
      expiring_certificates: rows.map(c => {
        const daysUntil = Math.ceil((new Date(c.next_inspection_date) - Date.now()) / 86400000);
        return {
          id: c.id,
          type: c.certificate_type,
          number: c.certificate_no,
          address: c.installation_address,
          postcode: c.installation_postcode,
          next_inspection: c.next_inspection_date,
          days_until_expiry: daysUntil,
          overdue: daysUntil < 0,
          customer_id: c.customer_id,
          customer_name: c.first_name ? `${c.first_name} ${c.last_name}` : null,
          customer_phone: c.phone,
          customer_email: c.email,
          last_reminder_sent: reminderMap[c.id] || null,
        };
      }),
    };
  },
};
