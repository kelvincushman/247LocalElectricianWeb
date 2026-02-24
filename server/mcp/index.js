#!/usr/bin/env node
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { ListToolsRequestSchema, CallToolRequestSchema } = require('@modelcontextprotocol/sdk/types.js');

const pool = require('./db');

// Import all tool handlers
const checkAvailability = require('./tools/checkAvailability');
const scheduleAppointment = require('./tools/scheduleAppointment');
const rescheduleAppointment = require('./tools/rescheduleAppointment');
const cancelAppointment = require('./tools/cancelAppointment');
const lookupCustomer = require('./tools/lookupCustomer');
const lookupJob = require('./tools/lookupJob');
const getJobStatus = require('./tools/getJobStatus');
const createDraftQuote = require('./tools/createDraftQuote');
const checkCertificateStatus = require('./tools/checkCertificateStatus');
const listCustomerCertificates = require('./tools/listCustomerCertificates');
const getCertificateDueDates = require('./tools/getCertificateDueDates');
const requestCertificate = require('./tools/requestCertificate');
const checkInvoiceStatus = require('./tools/checkInvoiceStatus');
const listOutstandingInvoices = require('./tools/listOutstandingInvoices');
const sendPaymentReminder = require('./tools/sendPaymentReminder');
const sendPaymentLink = require('./tools/sendPaymentLink');
const getInvoiceSummary = require('./tools/getInvoiceSummary');
const sendEmailTool = require('./tools/sendEmail');
const checkInbox = require('./tools/checkInbox');
const replyToEmail = require('./tools/replyToEmail');
const routeEmail = require('./tools/routeEmail');
const captureLead = require('./tools/captureLead');
const routeEnquiry = require('./tools/routeEnquiry');
const escalateToHuman = require('./tools/escalateToHuman');
const getServicesInfo = require('./tools/getServicesInfo');
const getPricing = require('./tools/getPricing');
const checkServiceArea = require('./tools/checkServiceArea');
const getBusinessInfo = require('./tools/getBusinessInfo');
const getElectricalAdvice = require('./tools/getElectricalAdvice');

const allTools = [
  checkAvailability,
  scheduleAppointment,
  rescheduleAppointment,
  cancelAppointment,
  lookupCustomer,
  lookupJob,
  getJobStatus,
  createDraftQuote,
  checkCertificateStatus,
  listCustomerCertificates,
  getCertificateDueDates,
  requestCertificate,
  checkInvoiceStatus,
  listOutstandingInvoices,
  sendPaymentReminder,
  sendPaymentLink,
  getInvoiceSummary,
  sendEmailTool,
  checkInbox,
  replyToEmail,
  routeEmail,
  captureLead,
  routeEnquiry,
  escalateToHuman,
  getServicesInfo,
  getPricing,
  checkServiceArea,
  getBusinessInfo,
  getElectricalAdvice,
];

// Build a lookup map for tool handlers
const toolMap = {};
for (const tool of allTools) {
  toolMap[tool.name] = tool;
}

async function main() {
  const server = new Server(
    { name: '247electrician-mcp', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  // Handle tools/list
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: allTools.map(tool => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
      })),
    };
  });

  // Handle tools/call
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const tool = toolMap[name];

    if (!tool) {
      return {
        content: [{ type: 'text', text: JSON.stringify({ error: `Unknown tool: ${name}` }) }],
        isError: true,
      };
    }

    try {
      const result = await tool.handler(args || {}, pool);
      return {
        content: [{
          type: 'text',
          text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
        }],
      };
    } catch (err) {
      console.error(`[MCP Tool Error] ${name}:`, err.message);
      return {
        content: [{ type: 'text', text: JSON.stringify({ error: err.message }) }],
        isError: true,
      };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[247 MCP Server] Running on stdio');
}

main().catch((err) => {
  console.error('[247 MCP Server] Fatal error:', err);
  process.exit(1);
});
