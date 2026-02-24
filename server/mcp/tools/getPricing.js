module.exports = {
  name: 'get_pricing',
  description: 'Return rate card / pricing guidelines for all electrical services.',
  inputSchema: {
    type: 'object',
    properties: {
      category: {
        type: 'string',
        description: 'Price category: callout_rates, sockets, lighting, consumer_units, testing, appliances, safety, large_projects',
      },
    },
  },
  handler: async (params) => {
    const pricing = {
      callout_rates: { title: "Callout Rates", note: "First hour minimum charge, additional time at hourly rate", items: { standard: { rate: "£79.99", hours: "Mon-Fri 8am-5pm", additional: "£45/hr" }, emergency: { rate: "£120", hours: "5pm-10pm, 7 days", additional: "£60/hr" }, night: { rate: "£150", hours: "10pm-7am, 7 days", additional: "£75/hr" } } },
      sockets: { title: "Sockets & Switches", items: { "Replace socket/switch (like-for-like)": "£45-£65", "Add new single socket": "£90-£130", "Add new double socket": "£100-£150", "Move existing socket": "£80-£120", "USB socket installation": "£55-£85", "Outdoor socket (IP66)": "£120-£180" } },
      lighting: { title: "Lighting", items: { "Replace light fitting (like-for-like)": "£45-£75", "Install new ceiling light": "£80-£120", "Install dimmer switch": "£55-£85", "Outdoor/security light": "£90-£150", "LED downlight (per light)": "£45-£70", "Garden lighting circuit": "£250-£450" } },
      consumer_units: { title: "Consumer Units / Fuse Boards", items: { "Replace fuse board (like-for-like)": "£350-£500", "Upgrade to RCBO board": "£450-£650", "Add new circuit": "£150-£250", "Replace single MCB/RCD": "£60-£100", "Surge protection device": "£120-£180" } },
      testing: { title: "Testing & Certificates", items: { "EICR (1-2 bed flat)": "£120-£160", "EICR (3 bed house)": "£150-£200", "EICR (4-5 bed house)": "£180-£250", "PAT testing (per item)": "£2-£4", "Emergency lighting test": "£80-£150", "Minor works certificate": "Included with work" } },
      appliances: { title: "Appliance Installation", items: { "Electric cooker connection": "£80-£120", "Electric hob installation": "£90-£140", "Electric shower installation": "£180-£280", "Extractor fan installation": "£100-£180", "Immersion heater": "£120-£200", "Towel rail installation": "£80-£130" } },
      safety: { title: "Safety & Ventilation", items: { "Smoke alarm (mains)": "£65-£95", "CO detector (mains)": "£70-£100", "Heat detector": "£65-£95", "Interlinked system (3 units)": "£200-£300", "Bathroom extractor fan": "£100-£180" } },
      large_projects: { title: "Larger Projects", note: "Prices vary based on property size and requirements. Free quotes available.", items: { "EV Charger Installation": "£750-£1,200", "Full House Rewire": "£3,000-£7,500", "Solar Panel Installation": "£4,000-£10,000", "Commercial Installation": "Quote required" } },
    };

    if (params.category && pricing[params.category]) return pricing[params.category];
    return pricing;
  },
};
