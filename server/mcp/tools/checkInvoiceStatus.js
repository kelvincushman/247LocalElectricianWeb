module.exports = {
  name: 'check_invoice_status',
  description: 'Look up invoice by number, job, or customer. Returns status, amount, payment history.',
  inputSchema: {
    type: 'object',
    properties: {
      invoice_id: { type: 'string', description: 'Invoice UUID' },
      invoice_number: { type: 'string', description: 'Invoice number' },
      job_id: { type: 'string', description: 'Job UUID' },
      customer_id: { type: 'string', description: 'Customer UUID' },
    },
  },
  handler: async (params, pool) => {
    let query = `
      SELECT i.*, c.first_name, c.last_name, c.phone, c.email,
             j.job_number, j.job_type
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      LEFT JOIN jobs j ON i.job_id = j.id
      WHERE 1=1
    `;
    const queryParams = [];
    let idx = 1;

    if (params.invoice_id) { query += ` AND i.id = $${idx++}`; queryParams.push(params.invoice_id); }
    else if (params.invoice_number) { query += ` AND i.invoice_number ILIKE $${idx++}`; queryParams.push(`%${params.invoice_number}%`); }
    else if (params.job_id) { query += ` AND i.job_id = $${idx++}`; queryParams.push(params.job_id); }
    else if (params.customer_id) { query += ` AND i.customer_id = $${idx++}`; queryParams.push(params.customer_id); }
    else return { error: 'Provide invoice_id, invoice_number, job_id, or customer_id' };

    query += ' ORDER BY i.created_at DESC LIMIT 10';

    const { rows } = await pool.query(query, queryParams);
    if (rows.length === 0) return { found: false, message: 'No invoices found' };

    const results = [];
    for (const inv of rows) {
      const { rows: payments } = await pool.query(
        'SELECT amount, payment_method, payment_date FROM invoice_payments WHERE invoice_id = $1 ORDER BY payment_date',
        [inv.id]
      );

      const outstanding = parseFloat(inv.total || 0) - parseFloat(inv.amount_paid || 0);
      const isOverdue = inv.status !== 'paid' && inv.due_date && new Date(inv.due_date) < new Date();

      results.push({
        id: inv.id,
        invoice_number: inv.invoice_number,
        total: `£${parseFloat(inv.total || 0).toFixed(2)}`,
        amount_paid: `£${parseFloat(inv.amount_paid || 0).toFixed(2)}`,
        outstanding: `£${outstanding.toFixed(2)}`,
        status: inv.status,
        overdue: isOverdue,
        days_overdue: isOverdue ? Math.ceil((Date.now() - new Date(inv.due_date)) / 86400000) : 0,
        due_date: inv.due_date,
        customer: inv.first_name ? `${inv.first_name} ${inv.last_name}` : null,
        customer_phone: inv.phone,
        customer_email: inv.email,
        job_number: inv.job_number,
        job_type: inv.job_type,
        payments: payments,
        reminder_count: inv.reminder_count || 0,
        last_reminder: inv.last_reminder_sent,
      });
    }

    return { found: true, count: results.length, invoices: results };
  },
};
