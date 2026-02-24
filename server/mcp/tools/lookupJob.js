module.exports = {
  name: 'lookup_job',
  description: 'Search for jobs by job number, customer ID, or status.',
  inputSchema: {
    type: 'object',
    properties: {
      job_number: { type: 'string', description: 'Job reference number' },
      customer_id: { type: 'string', description: 'Customer UUID' },
      status: { type: 'string', description: 'Job status filter: scheduled, in_progress, completed, cancelled, quoted' },
      limit: { type: 'number', description: 'Max results (default 20)' },
    },
  },
  handler: async (params, pool) => {
    let query = `
      SELECT j.*, c.first_name, c.last_name, c.phone, c.email,
             p.address_line1, p.postcode AS property_postcode
      FROM jobs j
      LEFT JOIN customers c ON j.customer_id = c.id
      LEFT JOIN properties p ON j.property_id = p.id
      WHERE 1=1
    `;
    const queryParams = [];
    let paramIdx = 1;

    if (params.job_number) { query += ` AND j.job_number ILIKE $${paramIdx++}`; queryParams.push(`%${params.job_number}%`); }
    if (params.customer_id) { query += ` AND j.customer_id = $${paramIdx++}`; queryParams.push(params.customer_id); }
    if (params.status) { query += ` AND j.status = $${paramIdx++}`; queryParams.push(params.status); }

    query += ` ORDER BY j.created_at DESC LIMIT $${paramIdx}`;
    queryParams.push(params.limit || 20);

    const { rows } = await pool.query(query, queryParams);
    return { found: rows.length > 0, count: rows.length, jobs: rows };
  },
};
