import { useEffect, useRef, useCallback } from "react";

export default function useNotificationsWS({
    token,
    onMessage,
    onOpen,
    onClose,
    enabled = true,
    pingIntervalMs = 25000,
}) {
    const wsRef = useRef(null);
    const attemptIdRef = useRef(0);
    const shouldCloseRef = useRef(false);
    const reconnectTimerRef = useRef(null);
    const pingTimerRef = useRef(null);
    const backoffRef = useRef(1000);

    const clearTimers = () => {
        if (reconnectTimerRef.current) { clearTimeout(reconnectTimerRef.current); reconnectTimerRef.current = null; }
        if (pingTimerRef.current) { clearInterval(pingTimerRef.current); pingTimerRef.current = null; }
    };

    const scheduleReconnect = useCallback(() => {
        clearTimers();
        const delay = Math.min(backoffRef.current, 30000);
        reconnectTimerRef.current = setTimeout(() => {
            backoffRef.current = Math.min(backoffRef.current * 2, 30000);
                connect();
        },  delay);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const connect = useCallback(() => {
        if (!enabled || !token) return;

        const thisAttempt = ++attemptIdRef.current;
        shouldCloseRef.current = false;

        const rawBase = (process.env.NEXT_PUBLIC_WS_BASE || "").trim().replace(/\/+$/, "");
        let origin;
        if (rawBase) {
            if (/^wss?:\/\//i.test(rawBase)) {
                origin = rawBase;
            } else if (/^https?:\/\//i.test(rawBase)) {
                // Viene como http(s)://host → mapea a ws(s)://host
                const u = new URL(rawBase);
                origin = (u.protocol === "https:" ? "wss://" : "ws://") + u.host;
            } else {
                // Solo host (sin esquema) → decide por el contexto del navegador
                const scheme = (typeof window !== "undefined" && window.location.protocol === "https:") ? "wss://" : "ws://";
                origin = scheme + rawBase;
            }
        } else {
            // Sin variable → cae al host actual del navegador
            const scheme = (typeof window !== "undefined" && window.location.protocol === "https:") ? "wss://" : "ws://";
            origin = scheme + window.location.host;
        }

        const ws = new WebSocket(url);
        wsRef.current = ws;

        const handleOpen = () => {
            if (shouldCloseRef.current || attemptIdRef.current !== thisAttempt) {
                try { ws.close(1000, "stale-attempt"); } catch {}
                return;
            }
            backoffRef.current = 1000;
            if (pingIntervalMs > 0) {
                pingTimerRef.current = setInterval(() => {
                    try {
                        if (wsRef.current?.readyState === WebSocket.OPEN) {
                            wsRef.current.send(JSON.stringify({ type: "ping" }));
                        }
                    } catch {}
                    }, pingIntervalMs);
            }
            onOpen?.();
        };

        const handleMessage = (ev) => {
            try {
                const data = JSON.parse(ev.data);
                onMessage?.(data);
            } catch {
                onMessage?.(ev.data);
            }
        };

        const handleClose = (e) => {
            clearTimers();
            if (attemptIdRef.current !== thisAttempt) return;
            wsRef.current = null;

            onClose?.(e);

            if (e.code === 4401 || e.code === 4403 || e.code === 1000) return;
            scheduleReconnect();
        };

        const handleError = () => { try { ws.close(); } catch {} };

        ws.addEventListener("open", handleOpen);
        ws.addEventListener("message", handleMessage);
        ws.addEventListener("close", handleClose);
        ws.addEventListener("error", handleError);

        return () => {
            ws.removeEventListener("open", handleOpen);
            ws.removeEventListener("message", handleMessage);
            ws.removeEventListener("close", handleClose);
            ws.removeEventListener("error", handleError);
            clearTimers();
            if (ws.readyState === WebSocket.CONNECTING) {
                shouldCloseRef.current = true;
            } else {
                try { ws.close(1000, "cleanup"); } catch {}
            }
            if (wsRef.current === ws) wsRef.current = null;
        };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled, token, onMessage, onOpen, onClose, pingIntervalMs]);

    useEffect(() => {
        const cleanup = connect();
        return () => cleanup && cleanup();
    }, [connect]);
}
