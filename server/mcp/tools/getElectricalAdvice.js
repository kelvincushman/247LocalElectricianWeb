module.exports = {
  name: 'get_electrical_advice',
  description: 'Provide safety advice and troubleshooting guidance for common electrical issues.',
  inputSchema: {
    type: 'object',
    properties: {
      topic: { type: 'string', description: 'Topic: tripping_circuits, power_loss, flickering_lights, socket_issues, safety_checks, when_to_call_electrician' },
      details: { type: 'string', description: 'Additional details about the issue' },
    },
    required: ['topic'],
  },
  handler: async (params) => {
    const advice = {
      tripping_circuits: { title: "Circuit Breakers Tripping", advice: ["Unplug all devices from the affected circuit", "Reset the tripped breaker (push it firmly to OFF then back to ON)", "Plug devices back in one at a time to identify the culprit", "If it trips immediately with nothing plugged in, you likely have a wiring fault - call an electrician", "Frequent tripping could indicate an overloaded circuit or faulty appliance"], when_to_call: "If the breaker trips repeatedly, won't reset, or trips with nothing connected" },
      power_loss: { title: "Power Loss", advice: ["Check if it's just your property - ask neighbors or check streetlights", "Check your consumer unit for tripped switches", "If it's a power cut, report to Western Power Distribution on 105", "Don't open the fridge/freezer - food stays cold for hours if door is closed", "Never attempt to fix main supply issues yourself"], when_to_call: "If power is out only in your property and breakers look fine" },
      flickering_lights: { title: "Flickering Lights", advice: ["First, try replacing the bulb - this is the most common cause", "Check the bulb is properly screwed in", "If multiple lights flicker together, it could be a loose connection", "Flickering when appliances turn on might indicate an overloaded circuit", "LED bulbs may flicker with incompatible dimmer switches"], when_to_call: "If flickering persists after changing bulbs, or affects multiple fixtures" },
      socket_issues: { title: "Socket Problems", advice: ["Never use a socket that shows signs of burning, sparking, or cracking", "Test with a different appliance to rule out a faulty device", "Check the socket switch is ON (common oversight!)", "Loose plugs are often caused by worn socket contacts", "Warm sockets or burning smells are URGENT - stop using immediately"], when_to_call: "Any signs of burning, sparking, warmth, or if sockets stop working" },
      safety_checks: { title: "Home Electrical Safety Checks", advice: ["Test your RCD monthly using the test button on your consumer unit", "Check for damaged cables, especially on older appliances", "Don't overload extension leads - add up the wattage", "Ensure outdoor electrics are weatherproof", "Get an EICR every 10 years (5 years for rentals)"], when_to_call: "For an EICR inspection or if you notice any warning signs" },
      when_to_call_electrician: { title: "When to Call an Electrician", advice: ["Any burning smell from electrics - this is urgent", "Sparks, smoke, or visible damage", "Frequent breaker trips", "Buzzing sounds from sockets or switches", "Any electrical work beyond changing bulbs or plugs", "Old wiring (rubber or fabric-covered cables)", "After flooding or water damage near electrics"], when_to_call: "For any of the above, or if you're unsure - it's always better to be safe" },
    };

    if (params.topic && advice[params.topic]) return advice[params.topic];
    return { title: "General Electrical Advice", message: "I can provide advice on: tripping circuits, power loss, flickering lights, socket issues, safety checks, and when to call an electrician." };
  },
};
