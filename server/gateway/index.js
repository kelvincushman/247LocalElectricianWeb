const WebSocket = require('ws');
const OpenClawClient = require('./openclawClient');
const SessionSync = require('./sessionSync');
const createGatewayRoutes = require('./routes');

function initGatewayRelay(server, app, pool, authMiddleware) {
  const sessionSync = new SessionSync(pool);

  // OpenClaw WebSocket client
  const openclawClient = new OpenClawClient({
    url: process.env.OPENCLAW_GATEWAY_URL || 'ws://localhost:18789',
    token: process.env.OPENCLAW_GATEWAY_TOKEN || '',
  });

  // Connect to OpenClaw
  openclawClient.connect();

  // WebSocket server for portal frontend clients
  const wss = new WebSocket.Server({ noServer: true });
  const portalClients = new Set();

  // Handle HTTP upgrade for /ws/gateway
  server.on('upgrade', (request, socket, head) => {
    if (request.url === '/ws/gateway') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });

  wss.on('connection', (ws) => {
    portalClients.add(ws);
    console.log('[Gateway WS] Portal client connected. Total:', portalClients.size);

    // Send initial status
    ws.send(JSON.stringify({
      type: 'status',
      gateway_connected: openclawClient.connected,
    }));

    ws.on('close', () => {
      portalClients.delete(ws);
      console.log('[Gateway WS] Portal client disconnected. Total:', portalClients.size);
    });

    ws.on('error', (err) => {
      console.error('[Gateway WS] Client error:', err.message);
      portalClients.delete(ws);
    });
  });

  // Broadcast to all connected portal clients
  function broadcastToPortal(data) {
    const payload = JSON.stringify(data);
    for (const client of portalClients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    }
  }

  // Handle messages from OpenClaw
  openclawClient.on('message', async (msg) => {
    try {
      if (msg.type === 'session_start' || msg.type === 'session_update') {
        const portalSessionId = await sessionSync.syncSession(msg);
        broadcastToPortal({ type: 'session_update', session_id: portalSessionId, data: msg });
      }

      if (msg.type === 'message') {
        // First ensure session exists
        const portalSessionId = await sessionSync.syncSession({
          session_id: msg.session_id,
          channel_type: msg.channel || 'unknown',
          sender_id: msg.sender_id || 'unknown',
          sender_name: msg.sender_name,
        });

        const stored = await sessionSync.syncMessage(portalSessionId, {
          direction: msg.direction || 'inbound',
          sender_type: msg.sender_type || 'user',
          content: msg.content,
          content_type: msg.content_type || 'text',
          media_url: msg.media_url,
          tool_calls: msg.tool_calls,
          tokens_used: msg.tokens_used,
          model_used: msg.model_used,
        });

        broadcastToPortal({
          type: 'new_message',
          session_id: portalSessionId,
          message: { id: stored.id, ...msg, created_at: stored.created_at },
        });
      }

      if (msg.type === 'escalation') {
        broadcastToPortal({ type: 'escalation', data: msg });
      }
    } catch (err) {
      console.error('[Gateway] Error processing OpenClaw message:', err.message);
    }
  });

  openclawClient.on('connected', () => {
    broadcastToPortal({ type: 'status', gateway_connected: true });
  });

  openclawClient.on('disconnected', () => {
    broadcastToPortal({ type: 'status', gateway_connected: false });
  });

  // Mount REST API routes (behind auth middleware)
  const gatewayRouter = createGatewayRoutes(pool, sessionSync, openclawClient);
  if (authMiddleware) {
    app.use('/api/portal/gateway', authMiddleware, gatewayRouter);
  } else {
    app.use('/api/portal/gateway', gatewayRouter);
  }

  console.log('[Gateway] Relay initialized. REST API at /api/portal/gateway, WebSocket at /ws/gateway');

  return { openclawClient, sessionSync, wss, broadcastToPortal };
}

module.exports = { initGatewayRelay };
