import { useEffect, useRef, useState, useCallback } from 'react';

interface GatewayMessage {
  type: string;
  [key: string]: unknown;
}

interface UseGatewayWebSocketReturn {
  connected: boolean;
  gatewayConnected: boolean;
  lastMessage: GatewayMessage | null;
  sendMessage: (data: unknown) => void;
}

export function useGatewayWebSocket(): UseGatewayWebSocketReturn {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [gatewayConnected, setGatewayConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<GatewayMessage | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>();

  const connect = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname;
    const port = import.meta.env.DEV ? '3247' : window.location.port;
    const url = `${protocol}//${host}:${port}/ws/gateway`;

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        console.log('[Gateway WS] Connected');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as GatewayMessage;
          setLastMessage(data);

          if (data.type === 'status' && 'gateway_connected' in data) {
            setGatewayConnected(data.gateway_connected as boolean);
          }
        } catch (err) {
          console.error('[Gateway WS] Parse error:', err);
        }
      };

      ws.onclose = () => {
        setConnected(false);
        wsRef.current = null;
        reconnectTimer.current = setTimeout(connect, 5000);
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch {
      reconnectTimer.current = setTimeout(connect, 5000);
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [connect]);

  const sendMessage = useCallback((data: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  return { connected, gatewayConnected, lastMessage, sendMessage };
}
