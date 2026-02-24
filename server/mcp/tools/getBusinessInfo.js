module.exports = {
  name: 'get_business_info',
  description: 'Return business info, accreditations (NAPIT), hours, contact details, team, guarantees.',
  inputSchema: {
    type: 'object',
    properties: {
      topic: { type: 'string', description: 'Topic: accreditations, team, experience, guarantees, payment, contact, opening_hours' },
    },
  },
  handler: async (params) => {
    const info = {
      accreditations: { title: "Our Accreditations", details: ["NAPIT Approved Contractor - Ensuring all work meets the latest regulations", "TrustMark Registered - Government endorsed quality", "Fully Insured - £5 million public liability cover", "Part P Certified - Qualified for notifiable electrical work", "All work complies with BS 7671 (18th Edition Wiring Regulations)"] },
      team: { title: "Meet the Team", details: ["Kelvin - Lead Electrician with 35+ years experience", "Andy - Senior Electrician with 30+ years experience", "All electricians are DBS checked", "Ongoing training on latest regulations and technology"] },
      experience: { title: "Our Experience", details: ["Over 65 years combined experience", "Thousands of jobs completed across the Black Country", "Specialists in domestic and commercial electrical work", "Expert in older properties and rewiring", "Experienced with EV charger installations"] },
      guarantees: { title: "Our Guarantees", details: ["All work guaranteed for 12 months", "Workmanship guarantee on installation", "Free callback if any issues arise", "Full certificates provided for all notifiable work"] },
      payment: { title: "Payment Options", details: ["Cash, Debit & Credit Cards accepted", "Apple Pay and Google Pay", "Bank Transfer", "Payment on completion for most jobs", "Deposit may be required for larger projects"] },
      contact: { title: "Contact Us", details: ["Phone: 01902 943 929 (24/7 for emergencies)", "Email: info@247electrician.uk", "WhatsApp: Available for enquiries", "Based in Bilston, serving the Black Country & Birmingham"] },
      opening_hours: { title: "Opening Hours", details: ["Standard appointments: Monday-Friday, 8am-5pm", "Emergency callouts: 24/7, 365 days a year", "Office enquiries: Monday-Friday, 8am-6pm", "Saturday appointments available by arrangement"] },
    };

    if (params.topic && info[params.topic]) return info[params.topic];
    return info;
  },
};
