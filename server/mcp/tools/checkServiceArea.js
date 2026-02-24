module.exports = {
  name: 'check_service_area',
  description: 'Check if a location or postcode is within our coverage area.',
  inputSchema: {
    type: 'object',
    properties: {
      location: { type: 'string', description: 'Area name or postcode (e.g., "Wolverhampton", "WV14", "Birmingham")' },
      postcode: { type: 'string', description: 'Postcode or prefix to check (e.g., "WV14", "B21")' },
    },
  },
  handler: async (params) => {
    const coveredAreas = [
      "wolverhampton", "walsall", "birmingham", "dudley", "west bromwich",
      "cannock", "tipton", "wednesbury", "bilston", "willenhall", "oldbury",
      "stourbridge", "halesowen", "great barr", "smethwick", "rowley regis",
      "cradley heath", "bearwood", "sedgley", "brierley hill", "kingswinford",
      "coseley", "handsworth", "erdington", "harborne", "perry barr",
      "tettenhall", "bushbury", "wednesfield", "penn", "bloxwich",
      "aldridge", "brownhills", "pelsall", "rushall", "wombourne",
      "codsall", "essington", "coven", "albrighton", "bridgnorth",
      "lichfield", "telford",
    ];
    const coveredPostcodes = ["wv", "ws", "b", "dy", "st"];
    const location = params.location || params.postcode || '';
    const locationLower = (location || '').toLowerCase().trim();
    if (!locationLower) return { error: 'Please provide a location or postcode to check.' };
    const isCovered = coveredAreas.some(area => locationLower.includes(area)) ||
                      coveredPostcodes.some(prefix => locationLower.startsWith(prefix));

    return {
      location: location,
      covered: isCovered,
      message: isCovered
        ? `Great news! We cover ${location}. We serve the Black Country, Birmingham, Walsall, and Cannock areas. Would you like to book an appointment or get a quote?`
        : `We primarily serve the Black Country and Birmingham area. ${location} may be outside our usual coverage, but please call us on 01902 943 929 to discuss - we may still be able to help!`,
    };
  },
};
