import { useCallback, useEffect, useRef, useState } from "react";

export default function useDMWebSocket({ baseWs, token, peerId, onMessage }) {
  const [ready, setReady] = useState(false);
  const [liveMessages, setLiveMessages] = useState([]);
  const wsRef = useRef(null);
  const retryRef = useRef(null);
  const onMessageRef = useRef(onMessage);

  useEffect(() => { onMessageRef.current = onMessage; }, [onMessage]);

  // Normaliza baseWs → ws(s)://... (sin doble slash)
  const buildUrl = useCallback(() => {
    if (!baseWs || !token || !peerId) return null;
    const base = baseWs.replace(/\/+$/, ""); // sin slash final
    const url = `${base}/ws/chat/u/${encodeURIComponent(peerId)}/?token=${encodeURIComponent(String(token).split(" ").pop())}`;
    // Forzar ws:// o wss:// si viene http(s)://
    if (url.startsWith("http://")) return "ws://" + url.slice(7);
    if (url.startsWith("https://")) return "wss://" + url.slice(8);
    return url;
  }, [baseWs, token, peerId]);

  const connect = useCallback(() => {
    const url = buildUrl();
    if (!url) return;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setReady(true);
      if (retryRef.current) { clearTimeout(retryRef.current); retryRef.current = null; }
    };

    ws.onclose = () => {
      setReady(false);
      // reconexión simple
      retryRef.current = setTimeout(connect, 1500);
    };

    ws.onerror = () => {
      try { ws.close(); } catch {}
    };

    ws.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data);
        // El DMConsumer envía: { type: "message", payload: {...} }
        if (data && data.type === "message" && data.payload) {
          setLiveMessages((prev) => [...prev, data.payload]);
          onMessageRef.current?.(data.payload);
          return;
        }
        // Mensajes de presencia (opcional)
        if (data && data.type === "presence") {
          // podrías manejar presencia aquí
          return;
        }
        // Fallback: si viniera plano o array
        if (Array.isArray(data)) {
          setLiveMessages((prev) => [...prev, ...data]);
          data.forEach((m) => onMessageRef.current?.(m));
          return;
        }
        if (data && (data.id != null || data.text != null || data.sender_id != null)) {
          setLiveMessages((prev) => [...prev, data]);
          onMessageRef.current?.(data);
        }
      } catch {
        // no-JSON: ignorar
      }
    };
  }, [buildUrl, connect]);

  useEffect(() => {
    connect();
    return () => {
      if (retryRef.current) clearTimeout(retryRef.current);
      retryRef.current = null;
      try { wsRef.current?.close(); } catch {}
    };
  }, [connect]);

  // Enviar texto al consumer (formato correcto)
  const sendText = useCallback((text) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== 1) return false; // 1 = OPEN
    const body = { action: "send", text: String(text ?? "").trim() };
    if (!body.text) return false;
    ws.send(JSON.stringify(body));
    return true;
  }, []);

  // Para enviar payloads personalizados (si algún día agregas otras actions)
  const sendPayload = useCallback((payload) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== 1) return false;
    ws.send(JSON.stringify(payload));
    return true;
  }, []);

  const resetLive = useCallback(() => setLiveMessages([]), []);

  return { ready, liveMessages, sendText, sendPayload, resetLive };
}