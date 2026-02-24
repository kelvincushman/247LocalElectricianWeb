module.exports = {
  name: 'get_services_info',
  description: 'Get information about electrical services offered including descriptions and pricing.',
  inputSchema: {
    type: 'object',
    properties: {
      service_type: {
        type: 'string',
        description: 'Optional filter: emergency, eicr, fuse_board, rewiring, ev_charger, solar, lighting, sockets, testing, appliances, safety',
      },
    },
  },
  handler: async (params) => {
    const services = {
      emergency: { name: "Emergency Callouts", description: "24/7 rapid response for electrical emergencies. We typically arrive within 30-90 minutes.", pricing: "From £79.99 (standard hours), £120 (evenings/weekends), £150 (night rate)", includes: ["Diagnosis", "Safe isolation", "Immediate repairs where possible"] },
      eicr: { name: "EICR Certificates", description: "Electrical Installation Condition Reports for landlords and homeowners. Required every 5 years for rental properties.", pricing: "£120-£250 depending on property size (1-2 bed: £120-£160, 3 bed: £150-£200, 4-5 bed: £180-£250)", includes: ["Full inspection", "Test results", "Certificate", "Recommendations"] },
      fuse_board: { name: "Fuse Board Upgrades", description: "Replace old fuse boxes with modern consumer units featuring RCDs and MCBs for better safety.", pricing: "£350-£650 (like-for-like: £350-£500, RCBO upgrade: £450-£650)", includes: ["New consumer unit", "Labeling", "Testing", "Certificate"] },
      rewiring: { name: "Full & Partial Rewiring", description: "Complete house rewires or partial updates for older properties with outdated wiring.", pricing: "£3,000-£7,500 depending on property size", includes: ["New wiring throughout", "New consumer unit", "Certification"] },
      ev_charger: { name: "EV Charger Installation", description: "Electric vehicle charger installation for home charging. We're approved installers for major brands.", pricing: "£750-£1,200 including supply, installation, and certification", includes: ["Charger supply", "Installation", "Certification", "OZEV grant advice"] },
      solar: { name: "Solar Panel Installation", description: "Solar panel installation for residential and commercial properties.", pricing: "£4,000-£10,000 depending on system size", includes: ["Supply", "Installation", "Certification", "Grid connection"] },
      lighting: { name: "Lighting Installation", description: "All types of lighting - indoor, outdoor, LED, security, and garden lighting.", pricing: "From £45 for replacements, £80-£450 for new installations", includes: ["Supply and fit", "Testing", "Certificate where required"] },
      sockets: { name: "Socket Installation", description: "New sockets, USB sockets, outdoor sockets, and socket relocations.", pricing: "£45-£180 depending on type and complexity", includes: ["Supply and fit", "Testing"] },
      testing: { name: "Electrical Testing & Certification", description: "EICR, PAT testing, emergency lighting testing, and electrical inspections.", pricing: "From £80 for testing, certificates included", includes: ["Full testing", "Report", "Certificate", "Recommendations"] },
      appliances: { name: "Appliance Installation", description: "Electric cookers, hobs, showers, extractor fans, and more.", pricing: "£80-£280 depending on appliance", includes: ["Connection", "Testing", "Certificate where required"] },
      safety: { name: "Smoke & CO Alarms", description: "Mains-powered smoke alarms, CO detectors, and interlinked systems. Required in rental properties.", pricing: "£65-£300 depending on system", includes: ["Supply", "Installation", "Testing", "Certificate"] },
    };

    if (params.service_type && services[params.service_type]) {
      return services[params.service_type];
    }
    return Object.entries(services).map(([key, value]) => ({ id: key, ...value }));
  },
};
