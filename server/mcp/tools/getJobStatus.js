module.exports = {
  name: 'get_job_status',
  description: 'Get detailed status of a specific job including notes, materials, and schedule.',
  inputSchema: {
    type: 'object',
    properties: {
      job_id: { type: 'string', description: 'Job UUID' },
      job_number: { type: 'string', description: 'Job reference number (alternative to job_id)' },
    },
  },
  handler: async (params, pool) => {
    let whereClause, queryParam;
    if (params.job_id) { whereClause = 'j.id = $1'; queryParam = params.job_id; }
    else if (params.job_number) { whereClause = 'j.job_number = $1'; queryParam = params.job_number; }
    else return { error: 'Provide either job_id or job_number' };

    const { rows: jobs } = await pool.query(`
      SELECT j.*, c.first_name, c.last_name, c.phone, c.email,
             p.address_line1, p.address_line2, p.city, p.postcode AS property_postcode
      FROM jobs j
      LEFT JOIN customers c ON j.customer_id = c.id
      LEFT JOIN properties p ON j.property_id = p.id
      WHERE ${whereClause}
    `, [queryParam]);

    if (jobs.length === 0) return { error: 'Job not found' };
    const job = jobs[0];

    // Fetch related data
    const [schedule, invoices, certificates] = await Promise.all([
      pool.query('SELECT id, title, start_date, start_time, end_date, end_time, assigned_to FROM schedule_entries WHERE job_id = $1', [job.id]),
      pool.query('SELECT id, invoice_number, total, amount_paid, status, due_date FROM invoices WHERE job_id = $1', [job.id]),
      pool.query('SELECT id, certificate_type, certificate_no, status FROM certificates WHERE job_id = $1', [job.id]),
    ]);

    return {
      job: {
        id: job.id,
        job_number: job.job_number,
        status: job.status,
        job_type: job.job_type,
        title: job.title,
        description: job.description,
        notes: job.notes,
        scheduled_date: job.scheduled_date,
        scheduled_time_start: job.scheduled_time_start,
        scheduled_time_end: job.scheduled_time_end,
        created_at: job.created_at,
      },
      customer: { name: `${job.first_name} ${job.last_name}`, phone: job.phone, email: job.email },
      property: job.address_line1 ? { address: job.address_line1, postcode: job.property_postcode } : null,
      schedule: schedule.rows,
      invoices: invoices.rows,
      certificates: certificates.rows,
    };
  },
};
