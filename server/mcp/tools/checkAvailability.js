module.exports = {
  name: 'check_availability',
  description: 'Check available appointment slots in a date range. Returns free time slots from the schedule.',
  inputSchema: {
    type: 'object',
    properties: {
      date_from: { type: 'string', description: 'Start date (YYYY-MM-DD). Defaults to today.' },
      date_to: { type: 'string', description: 'End date (YYYY-MM-DD). Defaults to 7 days from start.' },
      service_type: { type: 'string', description: 'Type of service to estimate duration' },
    },
  },
  handler: async (params, pool) => {
    const dateFrom = params.date_from || new Date().toISOString().split('T')[0];
    const dateTo = params.date_to || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

    const { rows: booked } = await pool.query(`
      SELECT start_date, start_time, end_date, end_time, title
      FROM schedule_entries
      WHERE start_date >= $1::date AND start_date <= $2::date
      ORDER BY start_date, start_time
    `, [dateFrom, dateTo]);

    // Build day-by-day availability (working hours 8am-5pm)
    const availability = [];
    const start = new Date(dateFrom);
    const end = new Date(dateTo);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayStr = d.toISOString().split('T')[0];
      const dayOfWeek = d.getDay();
      if (dayOfWeek === 0) continue; // Skip Sundays

      const dayBookings = booked.filter(b =>
        b.start_date && new Date(b.start_date).toISOString().split('T')[0] === dayStr
      );

      const slots = [];
      const workStart = 8;
      const workEnd = 17;
      let currentHour = workStart;

      for (const booking of dayBookings) {
        if (!booking.start_time) continue;
        const timeParts = booking.start_time.split(':');
        const bookStart = parseInt(timeParts[0]);
        const endParts = booking.end_time ? booking.end_time.split(':') : null;
        const bookEnd = endParts ? parseInt(endParts[0]) : bookStart + 1;

        if (currentHour < bookStart) {
          slots.push({ from: `${String(currentHour).padStart(2, '0')}:00`, to: `${String(bookStart).padStart(2, '0')}:00`, available: true });
        }
        currentHour = Math.max(currentHour, bookEnd);
      }

      if (currentHour < workEnd) {
        slots.push({ from: `${String(currentHour).padStart(2, '0')}:00`, to: `${String(workEnd).padStart(2, '0')}:00`, available: true });
      }

      availability.push({
        date: dayStr,
        day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek],
        slots,
        fully_booked: slots.length === 0,
      });
    }

    return {
      date_range: { from: dateFrom, to: dateTo },
      availability,
      total_available_days: availability.filter(a => !a.fully_booked).length,
    };
  },
};
