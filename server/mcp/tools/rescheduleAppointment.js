module.exports = {
  name: 'reschedule_appointment',
  description: 'Reschedule an existing appointment to a new date/time.',
  inputSchema: {
    type: 'object',
    properties: {
      job_id: { type: 'string', description: 'Job UUID to reschedule' },
      job_number: { type: 'string', description: 'Job number (alternative to job_id)' },
      new_date: { type: 'string', description: 'New appointment date (YYYY-MM-DD)' },
      new_start_time: { type: 'string', description: 'New start time (HH:MM)' },
      new_end_time: { type: 'string', description: 'New end time (HH:MM)' },
      reason: { type: 'string', description: 'Reason for rescheduling' },
    },
    required: ['new_date', 'new_start_time'],
  },
  handler: async (params, pool) => {
    // Find job
    let jobQuery = 'SELECT j.id, j.job_number, j.customer_id, c.first_name, c.last_name FROM jobs j LEFT JOIN customers c ON j.customer_id = c.id WHERE ';
    let jobParam;
    if (params.job_id) { jobQuery += 'j.id = $1'; jobParam = params.job_id; }
    else if (params.job_number) { jobQuery += 'j.job_number = $1'; jobParam = params.job_number; }
    else return { error: 'Provide either job_id or job_number' };

    const { rows: jobs } = await pool.query(jobQuery, [jobParam]);
    if (jobs.length === 0) return { error: 'Job not found' };
    const job = jobs[0];

    const endTime = params.new_end_time || `${(parseInt(params.new_start_time.split(':')[0]) + 2).toString().padStart(2, '0')}:${params.new_start_time.split(':')[1]}`;

    // Check conflicts (exclude current job's entry)
    const { rows: conflicts } = await pool.query(`
      SELECT id FROM schedule_entries
      WHERE start_date = $1::date AND start_time < $3::time AND end_time > $2::time AND job_id != $4
    `, [params.new_date, params.new_start_time, endTime, job.id]);
    if (conflicts.length > 0) return { error: 'New time slot conflicts with an existing appointment' };

    // Update schedule entry
    await pool.query(`
      UPDATE schedule_entries SET start_date = $1, start_time = $2, end_date = $3, end_time = $4, updated_at = NOW()
      WHERE job_id = $5
    `, [params.new_date, params.new_start_time, params.new_date, endTime, job.id]);

    // Update job scheduled date/times
    await pool.query(`
      UPDATE jobs SET scheduled_date = $1, scheduled_time_start = $2, scheduled_time_end = $3, updated_at = NOW() WHERE id = $4
    `, [params.new_date, params.new_start_time, endTime, job.id]);

    return {
      success: true,
      job_number: job.job_number,
      customer: `${job.first_name} ${job.last_name}`,
      new_appointment: { date: params.new_date, start: params.new_start_time, end: endTime },
      reason: params.reason || 'Not specified',
      message: `Appointment rescheduled for ${job.first_name} to ${params.new_date} at ${params.new_start_time}. Job: ${job.job_number}`,
    };
  },
};
