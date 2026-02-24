module.exports = {
  name: 'schedule_appointment',
  description: 'Schedule a new appointment. Creates a schedule entry and a job record.',
  inputSchema: {
    type: 'object',
    properties: {
      customer_id: { type: 'string', description: 'Customer UUID' },
      date: { type: 'string', description: 'Appointment date (YYYY-MM-DD)' },
      start_time: { type: 'string', description: 'Start time (HH:MM)' },
      end_time: { type: 'string', description: 'End time (HH:MM). Defaults to start + 2 hours.' },
      service_type: { type: 'string', description: 'Type of service (e.g. EICR, Rewiring, Emergency)' },
      description: { type: 'string', description: 'Description of work needed' },
      property_id: { type: 'string', description: 'Property UUID (optional)' },
      notes: { type: 'string', description: 'Additional notes' },
    },
    required: ['customer_id', 'date', 'start_time', 'service_type'],
  },
  handler: async (params, pool) => {
    const endTime = params.end_time || `${(parseInt(params.start_time.split(':')[0]) + 2).toString().padStart(2, '0')}:${params.start_time.split(':')[1]}`;

    // Check customer exists
    const { rows: customers } = await pool.query('SELECT id, first_name, last_name FROM customers WHERE id = $1', [params.customer_id]);
    if (customers.length === 0) return { error: 'Customer not found' };

    // Check for conflicts on the same date with overlapping times
    const { rows: conflicts } = await pool.query(`
      SELECT id FROM schedule_entries
      WHERE start_date = $1::date AND start_time < $3::time AND end_time > $2::time
    `, [params.date, params.start_time, endTime]);
    if (conflicts.length > 0) return { error: 'Time slot conflicts with an existing appointment', conflict_count: conflicts.length };

    // Create job (let trigger auto-generate job_number)
    const title = params.service_type || 'General';
    const { rows: [job] } = await pool.query(`
      INSERT INTO jobs (customer_id, property_id, status, job_type, title, description, scheduled_date, scheduled_time_start, scheduled_time_end, notes, created_at)
      VALUES ($1, $2, 'scheduled', $3, $4, $5, $6, $7, $8, $9, NOW())
      RETURNING id, job_number
    `, [params.customer_id, params.property_id || null, params.service_type, title, params.description || '', params.date, params.start_time, endTime, params.notes || '']);

    // Create schedule entry
    const entryTitle = `${params.service_type} - ${customers[0].first_name} ${customers[0].last_name}`;
    const { rows: [entry] } = await pool.query(`
      INSERT INTO schedule_entries (title, description, entry_type, assigned_to, start_date, start_time, end_date, end_time, job_id, created_at)
      VALUES ($1, $2, 'job', 'Unassigned', $3, $4, $5, $6, $7, NOW())
      RETURNING id
    `, [entryTitle, params.notes || '', params.date, params.start_time, params.date, endTime, job.id]);

    return {
      success: true,
      job_number: job.job_number,
      job_id: job.id,
      schedule_entry_id: entry.id,
      appointment: { date: params.date, start: params.start_time, end: endTime },
      customer: `${customers[0].first_name} ${customers[0].last_name}`,
      message: `Appointment booked for ${customers[0].first_name} on ${params.date} at ${params.start_time}. Job reference: ${job.job_number}`,
    };
  },
};
