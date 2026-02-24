module.exports = {
  name: 'get_invoice_summary',
  description: 'Get financial summary: total outstanding, overdue amount, recently paid, revenue stats.',
  inputSchema: {
    type: 'object',
    properties: {
      period_days: { type: 'number', description: 'Look-back period in days (default 30)' },
    },
  },
  handler: async (params, pool) => {
    const periodDays = params.period_days || 30;

    const [outstanding, overdue, recentlyPaid, totalRevenue] = await Promise.all([
      pool.query(`
        SELECT COUNT(*) AS count, COALESCE(SUM(total - COALESCE(amount_paid, 0)), 0) AS amount
        FROM invoices WHERE status NOT IN ('paid', 'cancelled', 'void')
      `),
      pool.query(`
        SELECT COUNT(*) AS count, COALESCE(SUM(total - COALESCE(amount_paid, 0)), 0) AS amount
        FROM invoices WHERE status NOT IN ('paid', 'cancelled', 'void') AND due_date < NOW()
      `),
      pool.query(`
        SELECT COUNT(*) AS count, COALESCE(SUM(total), 0) AS amount
        FROM invoices WHERE status = 'paid' AND paid_date >= NOW() - INTERVAL '${parseInt(periodDays)} days'
      `),
      pool.query(`
        SELECT COUNT(*) AS count, COALESCE(SUM(total), 0) AS amount
        FROM invoices WHERE created_at >= NOW() - INTERVAL '${parseInt(periodDays)} days'
      `),
    ]);

    // Chase effectiveness
    const { rows: [chaseStats] } = await pool.query(`
      SELECT COUNT(*) AS reminders_sent,
             COUNT(CASE WHEN payment_received THEN 1 END) AS payments_after_chase
      FROM gateway_invoice_chasing
      WHERE sent_at >= NOW() - INTERVAL '${parseInt(periodDays)} days'
    `);

    return {
      period: `Last ${periodDays} days`,
      outstanding: {
        count: parseInt(outstanding.rows[0].count),
        amount: `£${parseFloat(outstanding.rows[0].amount).toFixed(2)}`,
      },
      overdue: {
        count: parseInt(overdue.rows[0].count),
        amount: `£${parseFloat(overdue.rows[0].amount).toFixed(2)}`,
      },
      recently_paid: {
        count: parseInt(recentlyPaid.rows[0].count),
        amount: `£${parseFloat(recentlyPaid.rows[0].amount).toFixed(2)}`,
      },
      total_invoiced: {
        count: parseInt(totalRevenue.rows[0].count),
        amount: `£${parseFloat(totalRevenue.rows[0].amount).toFixed(2)}`,
      },
      chase_effectiveness: {
        reminders_sent: parseInt(chaseStats.reminders_sent),
        payments_received_after_chase: parseInt(chaseStats.payments_after_chase),
      },
    };
  },
};
