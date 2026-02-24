module.exports = {
  name: 'list_outstanding_invoices',
  description: 'List all unpaid or overdue invoices, optionally filtered by customer or date range.',
  inputSchema: {
    type: 'object',
    properties: {
      customer_id: { type: 'string', description: 'Filter by customer UUID' },
      status: { type: 'string', description: 'Filter: overdue, unpaid, partial' },
      date_from: { type: 'string', description: 'Invoice date from (YYYY-MM-DD)' },
      date_to: { type: 'string', description: 'Invoice date to (YYYY-MM-DD)' },
      limit: { type: 'number', description: 'Max results (default 50)' },
    },
  },
  handler: async (params, pool) => {
    let query = `
      SELECT i.id, i.invoice_number, i.total, i.amount_paid, i.status, i.due_date,
             i.reminder_count, i.last_reminder_sent, i.created_at,
             c.id AS customer_id, c.first_name, c.last_name, c.phone, c.email,
             j.job_number, j.job_type
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      LEFT JOIN jobs j ON i.job_id = j.id
      WHERE i.status NOT IN ('paid', 'cancelled', 'void')
    `;
    const queryParams = [];
    let idx = 1;

    if (params.customer_id) { query += ` AND i.customer_id = $${idx++}`; queryParams.push(params.customer_id); }
    if (params.status === 'overdue') { query += ` AND i.due_date < NOW()`; }
    if (params.date_from) { query += ` AND i.created_at >= $${idx++}::date`; queryParams.push(params.date_from); }
    if (params.date_to) { query += ` AND i.created_at <= $${idx++}::date + INTERVAL '1 day'`; queryParams.push(params.date_to); }

    query += ` ORDER BY i.due_date ASC NULLS LAST LIMIT $${idx}`;
    queryParams.push(params.limit || 50);

    const { rows } = await pool.query(query, queryParams);

    const totalOutstanding = rows.reduce((sum, inv) =>
      sum + (parseFloat(inv.total || 0) - parseFloat(inv.amount_paid || 0)), 0
    );

    return {
      count: rows.length,
      total_outstanding: `£${totalOutstanding.toFixed(2)}`,
      invoices: rows.map(inv => {
        const outstanding = parseFloat(inv.total || 0) - parseFloat(inv.amount_paid || 0);
        const isOverdue = inv.due_date && new Date(inv.due_date) < new Date();
        return {
          id: inv.id,
          invoice_number: inv.invoice_number,
          total: `£${parseFloat(inv.total || 0).toFixed(2)}`,
          outstanding: `£${outstanding.toFixed(2)}`,
          status: inv.status,
          overdue: isOverdue,
          days_overdue: isOverdue ? Math.ceil((Date.now() - new Date(inv.due_date)) / 86400000) : 0,
          due_date: inv.due_date,
          customer_id: inv.customer_id,
          customer: inv.first_name ? `${inv.first_name} ${inv.last_name}` : null,
          phone: inv.phone,
          email: inv.email,
          job_number: inv.job_number,
          reminder_count: inv.reminder_count || 0,
          last_reminder: inv.last_reminder_sent,
        };
      }),
    };
  },
};
