module.exports = {
  name: 'lookup_customer',
  description: 'Search for a customer by phone, email, name, or postcode. Returns full customer details including linked properties, jobs, invoices, and certificates.',
  inputSchema: {
    type: 'object',
    properties: {
      phone: { type: 'string', description: 'Phone number to search' },
      email: { type: 'string', description: 'Email address to search' },
      name: { type: 'string', description: 'Full or partial name to search' },
      postcode: { type: 'string', description: 'Postcode to search properties' },
      customer_id: { type: 'string', description: 'Direct lookup by customer UUID' },
    },
  },
  handler: async (params, pool) => {
    let query, queryParams;

    if (params.customer_id) {
      query = 'SELECT * FROM customers WHERE id = $1';
      queryParams = [params.customer_id];
    } else if (params.phone) {
      const phone = params.phone.replace(/\s+/g, '');
      query = `SELECT * FROM customers WHERE REPLACE(phone, ' ', '') ILIKE $1 OR REPLACE(COALESCE(phone_secondary, ''), ' ', '') ILIKE $1`;
      queryParams = [`%${phone}%`];
    } else if (params.email) {
      query = 'SELECT * FROM customers WHERE email ILIKE $1';
      queryParams = [`%${params.email}%`];
    } else if (params.name) {
      query = `SELECT * FROM customers WHERE first_name ILIKE $1 OR last_name ILIKE $1 OR (first_name || ' ' || last_name) ILIKE $1`;
      queryParams = [`%${params.name}%`];
    } else if (params.postcode) {
      query = `SELECT DISTINCT c.* FROM customers c
               JOIN properties p ON p.customer_id = c.id OR p.company_id = c.company_id
               WHERE p.postcode ILIKE $1`;
      queryParams = [`%${params.postcode}%`];
    } else {
      return { error: 'Provide at least one search parameter: phone, email, name, postcode, or customer_id' };
    }

    const { rows: customers } = await pool.query(query, queryParams);
    if (customers.length === 0) return { found: false, message: 'No customer found matching the search criteria' };

    // Enrich with related data
    const results = [];
    for (const cust of customers.slice(0, 10)) {
      const [properties, jobs, invoices, certificates] = await Promise.all([
        pool.query('SELECT id, address_line1, address_line2, city, postcode FROM properties WHERE customer_id = $1 LIMIT 10', [cust.id]),
        pool.query('SELECT id, job_number, status, job_type, scheduled_date, created_at FROM jobs WHERE customer_id = $1 ORDER BY created_at DESC LIMIT 10', [cust.id]),
        pool.query('SELECT id, invoice_number, total, amount_paid, status, due_date FROM invoices WHERE customer_id = $1 ORDER BY created_at DESC LIMIT 10', [cust.id]),
        pool.query(`SELECT id, certificate_type, certificate_no, status, inspection_date, next_inspection_date FROM certificates WHERE customer_id = $1 ORDER BY created_at DESC LIMIT 10`, [cust.id]),
      ]);

      results.push({
        id: cust.id,
        first_name: cust.first_name,
        last_name: cust.last_name,
        email: cust.email,
        phone: cust.phone,
        phone_secondary: cust.phone_secondary,
        company_id: cust.company_id,
        address_line1: cust.address_line1,
        address_line2: cust.address_line2,
        city: cust.city,
        postcode: cust.postcode,
        customer_type: cust.customer_type,
        notes: cust.notes,
        created_at: cust.created_at,
        properties: properties.rows,
        recent_jobs: jobs.rows,
        recent_invoices: invoices.rows,
        certificates: certificates.rows,
      });
    }

    return { found: true, count: results.length, customers: results };
  },
};
