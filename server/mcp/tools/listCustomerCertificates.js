module.exports = {
  name: 'list_customer_certificates',
  description: 'List all certificates for a customer or property with dates and types (EICR, EICS, MW, etc.).',
  inputSchema: {
    type: 'object',
    properties: {
      customer_id: { type: 'string', description: 'Customer UUID' },
      property_id: { type: 'string', description: 'Property UUID' },
      postcode: { type: 'string', description: 'Property postcode to search' },
      certificate_type: { type: 'string', description: 'Filter by type: EICR, EICS, MW, EIC' },
    },
  },
  handler: async (params, pool) => {
    let query = `
      SELECT c.id, c.certificate_type, c.certificate_no, c.status, c.created_at,
             c.installation_address, c.installation_postcode,
             c.next_inspection_date, c.inspection_date,
             j.job_number, cu.first_name, cu.last_name
      FROM certificates c
      LEFT JOIN jobs j ON c.job_id = j.id
      LEFT JOIN customers cu ON c.customer_id = cu.id
      WHERE 1=1
    `;
    const queryParams = [];
    let idx = 1;

    if (params.customer_id) { query += ` AND c.customer_id = $${idx++}`; queryParams.push(params.customer_id); }
    if (params.property_id) { query += ` AND c.property_id = $${idx++}`; queryParams.push(params.property_id); }
    if (params.postcode) { query += ` AND c.installation_postcode ILIKE $${idx++}`; queryParams.push(`%${params.postcode}%`); }
    if (params.certificate_type) { query += ` AND c.certificate_type = $${idx++}`; queryParams.push(params.certificate_type); }

    if (idx === 1) return { error: 'Provide at least one search parameter' };

    query += ' ORDER BY c.created_at DESC';
    const { rows } = await pool.query(query, queryParams);

    return {
      count: rows.length,
      certificates: rows.map(c => ({
        id: c.id,
        type: c.certificate_type,
        number: c.certificate_no,
        status: c.status,
        address: c.installation_address,
        postcode: c.installation_postcode,
        inspection_date: c.inspection_date,
        next_inspection: c.next_inspection_date,
        job_number: c.job_number,
        customer: c.first_name ? `${c.first_name} ${c.last_name}` : null,
        created: c.created_at,
      })),
    };
  },
};
