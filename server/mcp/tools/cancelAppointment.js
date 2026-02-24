module.exports = {
  name: 'cancel_appointment',
  description: 'Cancel an existing appointment. Updates job status and removes schedule entry.',
  inputSchema: {
    type: 'object',
    properties: {
      job_id: { type: 'string', description: 'Job UUID to cancel' },
      job_number: { type: 'string', description: 'Job number (alternative to job_id)' },
      reason: { type: 'string', description: 'Reason for cancellation' },
    },
  },
  handler: async (params, pool) => {
    let jobQuery = 'SELECT j.id, j.job_number, j.customer_id, c.first_name, c.last_name FROM jobs j LEFT JOIN customers c ON j.customer_id = c.id WHERE ';
    let jobParam;
    if (params.job_id) { jobQuery += 'j.id = $1'; jobParam = params.job_id; }
    else if (params.job_number) { jobQuery += 'j.job_number = $1'; jobParam = params.job_number; }
    else return { error: 'Provide either job_id or job_number' };

    const { rows: jobs } = await pool.query(jobQuery, [jobParam]);
    if (jobs.length === 0) return { error: 'Job not found' };
    const job = jobs[0];

    // Delete schedule entry
    await pool.query('DELETE FROM schedule_entries WHERE job_id = $1', [job.id]);

    // Update job status
    await pool.query(`
      UPDATE jobs SET status = 'cancelled', notes = COALESCE(notes, '') || $1, updated_at = NOW()
      WHERE id = $2
    `, [params.reason ? `\nCancelled: ${params.reason}` : '\nCancelled by customer', job.id]);

    return {
      success: true,
      job_number: job.job_number,
      customer: `${job.first_name} ${job.last_name}`,
      reason: params.reason || 'Not specified',
      message: `Appointment cancelled for ${job.first_name}. Job ${job.job_number} marked as cancelled.`,
    };
  },
};
