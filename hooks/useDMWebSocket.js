import { useCallback, useEffect, useRef, useState } from "react";

export default function useDMWebSocket({
  baseWs = (typeof window !== "undefined" && process.env.NEXT_PUBLIC_WS_BASE) || "ws://localhost:8001",
  token,
  peerId,
  onMessage,
}) {
  const [ready, setReady] = useState(false);
  const [liveMessages, setLiveMessages] = useState([]);
  const wsRef = useRef(null);
  const retryRef = useRef(null);
  const onMessageRef = useRef(onMessage);

  useEffect(() => { onMessageRef.current = onMessage; }, [onMessage]);

  const buildUrl = useCallback(() => {
    if (!baseWs || !token || !peerId) return null;
    const base = baseWs.replace(/\/+$/, "");
    let url = `${base}/ws/chat/u/${encodeURIComponent(peerId)}/?token=${encodeURIComponent(String(token).split(" ").pop())}`;
    if (url.startsWith("http://")) url = "ws://" + url.slice(7);
    if (url.startsWith("https://")) url = "wss://" + url.slice(8);
    return url;
  }, [baseWs, token, peerId]);

  const connect = useCallback(() => {
    const url = buildUrl();
    if (!url) return;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      // console.log("[WS] OPEN", url);
      setReady(true);
      if (retryRef.current) { clearTimeout(retryRef.current); retryRef.current = null; }
    };

    ws.onclose = (e) => {
      // console.log("[WS] CLOSE", e.code, e.reason);
      setReady(false);
      if (retryRef.current) clearTimeout(retryRef.current);
      retryRef.current = setTimeout(connect, 1500);
    };

    ws.onerror = (e) => {
      // console.log("[WS] ERROR", e);
      try { ws.close(); } catch {}
    };

    ws.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data);
        if (data && data.type === "message" && data.payload) {
          setLiveMessages((prev) => [...prev, data.payload]);
          onMessageRef.current?.(data.payload);
          return;
        }
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
        // not JSON
      }
    };
  }, [buildUrl]);

  useEffect(() => {
    connect();
    return () => {
      if (retryRef.current) clearTimeout(retryRef.current);
      retryRef.current = null;
      try { wsRef.current?.close(); } catch {}
    };
  }, [connect]);

  const sendPayload = useCallback((payload) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== 1) return false; // 1 = OPEN
    ws.send(JSON.stringify(payload));
    return true;
  }, []);

  const resetLive = useCallback(() => setLiveMessages([]), []);

  return { ready, liveMessages, sendPayload, resetLive };
}