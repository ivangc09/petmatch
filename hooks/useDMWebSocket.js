import { useCallback, useEffect, useRef, useState } from "react";

export default function useDMWebSocket({ baseWs, token, peerId }) {
  const [ready, setReady] = useState(false);
  const [liveMessages, setLiveMessages] = useState([]);
  const wsRef = useRef(null);
  const retryRef = useRef(null);

  const resetLive = useCallback(() => setLiveMessages([]), []);

  const connect = useCallback(() => {
    if (!baseWs || !token || !peerId) return;
    const url = `${baseWs}/ws/chat/u/${peerId}/?token=${encodeURIComponent(token)}`;
    const ws = new WebSocket(url);

    ws.onopen = () => setReady(true);
    ws.onclose = () => {
      setReady(false);
      retryRef.current = setTimeout(connect, 1500);
    };
    ws.onerror = () => ws.close();
    ws.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data);
        // Esperamos { type: "message", message: {...} }
        if (data?.type === "message" && data?.message) {
          setLiveMessages((prev) => [...prev, data.message]);
        }
      } catch {
        // no-op
      }
    };

    wsRef.current = ws;
  }, [baseWs, token, peerId]);

  useEffect(() => {
    connect();
    return () => {
      if (retryRef.current) clearTimeout(retryRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  // Enviar payload ya listo { type, text, client_id }
  const sendPayload = useCallback((payload) => {
    if (!wsRef.current || wsRef.current.readyState !== 1) return false;
    const body =
      typeof payload === "string"
        ? { type: "message", text: payload }
        : payload;
    wsRef.current.send(JSON.stringify(body));
    return true;
  }, []);

  return { ready, liveMessages, sendPayload, resetLive };
}
