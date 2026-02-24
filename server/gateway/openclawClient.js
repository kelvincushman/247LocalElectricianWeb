const WebSocket = require('ws');
const EventEmitter = require('events');

class OpenClawClient extends EventEmitter {
  constructor(config = {}) {
    super();
    this.url = config.url || 'ws://localhost:18789';
    this.token = config.token || process.env.OPENCLAW_GATEWAY_TOKEN || '';
    this.ws = null;
    this.connected = false;
    this.reconnectTimer = null;
    this.reconnectInterval = config.reconnectInterval || 5000;
    this.maxReconnectInterval = 30000;
    this.currentReconnectInterval = this.reconnectInterval;
  }

  connect() {
    if (this.ws) {
      try { this.ws.close(); } catch (e) { /* ignore */ }
    }

    try {
      this.ws = new WebSocket(this.url, {
        headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
      });

      this.ws.on('open', () => {
        console.log('[Gateway] Connected to OpenClaw at', this.url);
        this.connected = true;
        this.currentReconnectInterval = this.reconnectInterval;
        this.emit('connected');
      });

      this.ws.on('message', (data) => {
        try {
          const msg = JSON.parse(data.toString());
          this.emit('message', msg);

          if (msg.type) {
            this.emit(msg.type, msg);
          }
        } catch (err) {
          console.error('[Gateway] Failed to parse message:', err.message);
        }
      });

      this.ws.on('close', (code, reason) => {
        console.log('[Gateway] Disconnected from OpenClaw:', code, reason?.toString());
        this.connected = false;
        this.emit('disconnected', { code, reason: reason?.toString() });
        this.scheduleReconnect();
      });

      this.ws.on('error', (err) => {
        console.error('[Gateway] WebSocket error:', err.message);
        this.emit('error', err);
      });
    } catch (err) {
      console.error('[Gateway] Connection error:', err.message);
      this.scheduleReconnect();
    }
  }

  scheduleReconnect() {
    if (this.reconnectTimer) return;
    console.log(`[Gateway] Reconnecting in ${this.currentReconnectInterval}ms...`);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
      this.currentReconnectInterval = Math.min(
        this.currentReconnectInterval * 1.5,
        this.maxReconnectInterval
      );
    }, this.currentReconnectInterval);
  }

  send(data) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('[Gateway] Not connected, cannot send');
      return false;
    }
    this.ws.send(JSON.stringify(data));
    return true;
  }

  sendReply(sessionId, content, channel) {
    return this.send({
      type: 'staff_reply',
      session_id: sessionId,
      content,
      channel,
    });
  }

  getStatus() {
    return {
      connected: this.connected,
      url: this.url,
      readyState: this.ws ? this.ws.readyState : -1,
    };
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connected = false;
  }
}

module.exports = OpenClawClient;
