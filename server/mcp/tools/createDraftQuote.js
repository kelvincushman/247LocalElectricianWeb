module.exports = {
  name: 'create_draft_quote',
  description: 'Create a draft quote with line items and pricing. Saved for staff review and approval before sending to customer.',
  inputSchema: {
    type: 'object',
    properties: {
      customer_id: { type: 'string', description: 'Customer UUID' },
      property_id: { type: 'string', description: 'Property UUID (optional)' },
      items: {
        type: 'array',
        description: 'Quote line items',
        items: {
          type: 'object',
          properties: {
            description: { type: 'string' },
            quantity: { type: 'number' },
            unit_price: { type: 'number' },
            item_type: { type: 'string', description: 'labour or materials (default: labour)' },
          },
        },
      },
      notes: { type: 'string', description: 'Additional notes for the quote' },
      service_type: { type: 'string', description: 'Type of service being quoted' },
      valid_days: { type: 'number', description: 'Quote validity in days (default 30)' },
    },
    required: ['customer_id', 'items'],
  },
  handler: async (params, pool) => {
    // Verify customer
    const { rows: customers } = await pool.query('SELECT id, first_name, last_name FROM customers WHERE id = $1', [params.customer_id]);
    if (customers.length === 0) return { error: 'Customer not found' };

    const subtotal = params.items.reduce((sum, item) => sum + (item.quantity || 1) * (item.unit_price || 0), 0);
    const vatRate = 20;
    const vatAmount = subtotal * (vatRate / 100);
    const total = subtotal + vatAmount;
    const validUntil = new Date(Date.now() + (params.valid_days || 30) * 86400000).toISOString().split('T')[0];

    // Create quote (let trigger auto-generate quote_number)
    const { rows: [quote] } = await pool.query(`
      INSERT INTO quotes (customer_id, property_id, status, subtotal, vat_rate, vat_amount, total, notes, valid_until, created_at)
      VALUES ($1, $2, 'draft', $3, $4, $5, $6, $7, $8, NOW())
      RETURNING id, quote_number
    `, [params.customer_id, params.property_id || null, subtotal, vatRate, vatAmount, total, params.notes || '', validUntil]);

    // Insert quote items
    for (let i = 0; i < params.items.length; i++) {
      const item = params.items[i];
      const qty = item.quantity || 1;
      const unitPrice = item.unit_price || 0;
      const totalPrice = qty * unitPrice;
      await pool.query(`
        INSERT INTO quote_items (quote_id, item_type, description, quantity, unit_price, total_price, display_order)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [quote.id, item.item_type || 'labour', item.description || '', qty, unitPrice, totalPrice, i]);
    }

    return {
      success: true,
      quote_id: quote.id,
      quote_number: quote.quote_number,
      customer: `${customers[0].first_name} ${customers[0].last_name}`,
      subtotal: `£${subtotal.toFixed(2)}`,
      vat: `£${vatAmount.toFixed(2)}`,
      total: `£${total.toFixed(2)}`,
      valid_until: validUntil,
      items_count: params.items.length,
      status: 'draft',
      message: `Draft quote ${quote.quote_number} created for £${total.toFixed(2)} (inc. VAT). Awaiting staff review before sending to customer.`,
    };
  },
};
