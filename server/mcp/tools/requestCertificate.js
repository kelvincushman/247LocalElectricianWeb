module.exports = {
  name: 'request_certificate',
  description: 'Create a certificate request linked to a job or property.',
  inputSchema: {
    type: 'object',
    properties: {
      customer_id: { type: 'string', description: 'Customer UUID' },
      property_id: { type: 'string', description: 'Property UUID (required)' },
      certificate_type: { type: 'string', description: 'Certificate type: EICR, EICS, MW, EIC' },
      job_id: { type: 'string', description: 'Related job UUID (optional)' },
      notes: { type: 'string', description: 'Additional notes' },
      preferred_date: { type: 'string', description: 'Preferred inspection date (YYYY-MM-DD)' },
    },
    required: ['customer_id', 'property_id', 'certificate_type'],
  },
  handler: async (params, pool) => {
    const { rows: customers } = await pool.query('SELECT id, first_name, last_name FROM customers WHERE id = $1', [params.customer_id]);
    if (customers.length === 0) return { error: 'Customer not found' };

    const { rows: properties } = await pool.query('SELECT id, address_line1, postcode FROM properties WHERE id = $1', [params.property_id]);
    if (properties.length === 0) return { error: 'Property not found' };

    const { rows: [request] } = await pool.query(`
      INSERT INTO certificate_requests (customer_id, property_id, certificate_type, assigned_job_id, notes, preferred_date, status, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, 'pending', NOW())
      RETURNING id
    `, [
      params.customer_id, params.property_id,
      params.certificate_type, params.job_id || null,
      params.notes || '', params.preferred_date || null,
    ]);

    return {
      success: true,
      request_id: request.id,
      certificate_type: params.certificate_type,
      customer: `${customers[0].first_name} ${customers[0].last_name}`,
      property: `${properties[0].address_line1}, ${properties[0].postcode}`,
      preferred_date: params.preferred_date || 'To be arranged',
      message: `Certificate request created for ${params.certificate_type}. Our team will arrange the inspection.`,
    };
  },
};
