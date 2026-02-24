module.exports = {
  name: 'check_certificate_status',
  description: 'Look up certificate by reference, job, or customer. Returns status (draft/submitted/approved), type, and details.',
  inputSchema: {
    type: 'object',
    properties: {
      certificate_id: { type: 'string', description: 'Certificate UUID' },
      certificate_no: { type: 'string', description: 'Certificate reference number' },
      job_id: { type: 'string', description: 'Job UUID to find related certificates' },
      customer_id: { type: 'string', description: 'Customer UUID' },
    },
  },
  handler: async (params, pool) => {
    let query = `
      SELECT c.id, c.certificate_type, c.certificate_no, c.status, c.created_at,
             c.inspection_date, c.next_inspection_date, c.overall_assessment,
             c.installation_address, c.installation_postcode,
             j.job_number, cu.first_name, cu.last_name, cu.email, cu.phone
      FROM certificates c
      LEFT JOIN jobs j ON c.job_id = j.id
      LEFT JOIN customers cu ON c.customer_id = cu.id
      WHERE 1=1
    `;
    const queryParams = [];
    let idx = 1;

    if (params.certificate_id) { query += ` AND c.id = $${idx++}`; queryParams.push(params.certificate_id); }
    else if (params.certificate_no) { query += ` AND c.certificate_no ILIKE $${idx++}`; queryParams.push(`%${params.certificate_no}%`); }
    else if (params.job_id) { query += ` AND c.job_id = $${idx++}`; queryParams.push(params.job_id); }
    else if (params.customer_id) { query += ` AND c.customer_id = $${idx++}`; queryParams.push(params.customer_id); }
    else return { error: 'Provide certificate_id, certificate_no, job_id, or customer_id' };

    query += ' ORDER BY c.created_at DESC LIMIT 10';

    const { rows } = await pool.query(query, queryParams);
    if (rows.length === 0) return { found: false, message: 'No certificates found' };

    return {
      found: true,
      count: rows.length,
      certificates: rows.map(cert => ({
        id: cert.id,
        type: cert.certificate_type,
        number: cert.certificate_no,
        status: cert.status,
        address: cert.installation_address,
        postcode: cert.installation_postcode,
        inspection_date: cert.inspection_date,
        next_inspection_date: cert.next_inspection_date,
        overall_assessment: cert.overall_assessment,
        job_number: cert.job_number,
        customer: cert.first_name ? `${cert.first_name} ${cert.last_name}` : null,
        created: cert.created_at,
      })),
    };
  },
};
