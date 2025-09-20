import { useCallback, useEffect, useRef, useState } from "react";

export default function useDMWebSocket({ baseWs, token, peerId, onMessage }) {
  const [ready, setReady] = useState(false);
  const [liveMessages, setLiveMessages] = useState([]);
  const wsRef = useRef(null);
  const retryRef = useRef(null);
  const onMessageRef = useRef(onMessage);

  // mantener la ref actualizada sin causar re-conexiones
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  const resetLive = useCallback(() => setLiveMessages([]), []);

  const connect = useCallback(() => {
    if (!baseWs || !token || !peerId) return;
    const url = `${baseWs}/ws/chat/u/${encodeURIComponent(peerId)}/?token=${encodeURIComponent(token)}`;
    const ws = new WebSocket(url);

    ws.onopen = () => {
      setReady(true);
      if (retryRef.current) {
        clearTimeout(retryRef.current);
        retryRef.current = null;
      }
    };

    ws.onclose = () => {
      setReady(false);
      retryRef.current = setTimeout(connect, 1500);
    };

    ws.onerror = () => {
      try { ws.close(); } catch { /* no-op */ }
    };

    ws.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data);
        // A) { type: "message", message: {...} }
        if (data && data.type === "message" && data.message) {
          setLiveMessages((prev) => [...prev, data.message]);
          // emitir al instante
          onMessageRef.current?.(data.message);
          return;
        }
        // B) Objeto plano { id, sender_id, text, created_at, client_id? }
        if (data && (data.id != null || data.text != null || data.sender_id != null || data.created_at != null)) {
          setLiveMessages((prev) => [...prev, data]);
          onMessageRef.current?.(data);
          return;
        }
        // C) Batch
        if (Array.isArray(data)) {
          setLiveMessages((prev) => [...prev, ...data]);
          data.forEach((m) => onMessageRef.current?.(m));
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
      retryRef.current = null;
      try { wsRef.current?.close(); } catch { /* no-op */ }
    };
  }, [connect]);

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
