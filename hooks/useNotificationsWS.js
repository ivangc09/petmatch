import { useCallback, useEffect, useRef } from "react";

export default function useNotificationsWS({
	token,
	enabled,
	onMessage,
	onOpen,
	onClose,
	pingIntervalMs = 25000,
	reconnectIntervalMs = 5000,
}) {
	const wsRef = useRef(null);
	const attemptIdRef = useRef(0);
	const reconnectTimerRef = useRef(null);
	const pingTimerRef = useRef(null);
	const shouldCloseRef = useRef(false);

	const clearTimers = useCallback(() => {
		if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
		if (pingTimerRef.current) clearInterval(pingTimerRef.current);
		reconnectTimerRef.current = null;
		pingTimerRef.current = null;
	}, []);

	const connect = useCallback(() => {
		if (!enabled || !token) return;

		const thisAttempt = ++attemptIdRef.current;
		shouldCloseRef.current = false;

		// Normaliza el origin del WS
		const rawBase = (process.env.NEXT_PUBLIC_WS_BASE || "").trim().replace(/\/+$/, "");
		let origin;
		if (rawBase) {
			if (/^wss?:\/\//i.test(rawBase)) {
				origin = rawBase;
			} else if (/^https?:\/\//i.test(rawBase)) {
				const u = new URL(rawBase);
				origin = (u.protocol === "https:" ? "wss://" : "ws://") + u.host;
			} else {
				const scheme = (typeof window !== "undefined" && window.location.protocol === "https:")
					? "wss://" : "ws://";
				origin = scheme + rawBase;
			}
		} else {
			const scheme = (typeof window !== "undefined" && window.location.protocol === "https:")
				? "wss://" : "ws://";
			origin = scheme + window.location.host;
		}

		const jwt = String(token).split(" ").pop();
		const url = `${origin}/ws/notifications/?token=${encodeURIComponent(jwt)}`;

		clearTimers();
		const prev = wsRef.current;
		if (prev) {
			if (prev.readyState === WebSocket.CONNECTING) {
				shouldCloseRef.current = true;
			} else {
				try { prev.close(1000, "reconnect"); } catch {}
			}
		}

		const ws = new WebSocket(url);
		wsRef.current = ws;

		ws.onopen = () => {
			if (thisAttempt !== attemptIdRef.current) return;
			if (pingIntervalMs > 0) {
				pingTimerRef.current = setInterval(() => {
					if (wsRef.current?.readyState === WebSocket.OPEN) {
						wsRef.current.send(JSON.stringify({ type: "ping" }));
					}
				}, pingIntervalMs);
			}
			onOpen?.();
		};

		ws.onmessage = (e) => {
			if (thisAttempt !== attemptIdRef.current) return;
			try {
				const data = JSON.parse(e.data);
				onMessage?.(data);
			} catch (err) {
				console.error("WS parse error", err);
			}
		};

		ws.onclose = () => {
			if (thisAttempt !== attemptIdRef.current) return;
			clearTimers();
			wsRef.current = null;
			if (!shouldCloseRef.current) {
			reconnectTimerRef.current = setTimeout(connect, reconnectIntervalMs);
			}
			onClose?.();
		};

		ws.onerror = () => {
			if (thisAttempt !== attemptIdRef.current) return;
			try { ws.close(); } catch {}
		};
	}, [enabled, token, onMessage, onOpen, onClose, pingIntervalMs, reconnectIntervalMs]);

  	// scheduleReconnect ahora depende de connect fresco
	const scheduleReconnect = useCallback(() => {
		if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
		reconnectTimerRef.current = setTimeout(connect, reconnectIntervalMs);
	}, [connect, reconnectIntervalMs]);

	useEffect(() => {
		connect();
		return () => {
			shouldCloseRef.current = true;
			clearTimers();
			wsRef.current?.close(1000, "unmount");
		};
	}, [connect, clearTimers]);

	return {
		close: () => {
			shouldCloseRef.current = true;
			clearTimers();
			wsRef.current?.close(1000, "manual");
		},
		reconnect: scheduleReconnect,
	};
}
