"use client";

import { useEffect, useRef, useState } from "react";
import ListaConversacion from "./ListaConversacion";
import ListaMensajes from "./ListaMensajes";
import InputMensaje from "./InputMensaje";
import useDMWebSocket from "@/hooks/useDMWebSocket";

const API_BASE =
  (typeof window !== "undefined" && process.env.NEXT_PUBLIC_API_BASE) ||
  "http://localhost:8000";

function makeClientId() {
  return `c_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Intenta obtener peerId desde prop, URL (?peer=) o localStorage */
function resolveInitialPeerId(initialPeerIdProp) {
  if (initialPeerIdProp != null && !Number.isNaN(Number(initialPeerIdProp))) {
    return Number(initialPeerIdProp);
  }
  try {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const pid = sp.get("peer");
      if (pid != null && !Number.isNaN(Number(pid))) return Number(pid);
    }
  } catch {}
  try {
    if (typeof window !== "undefined") {
      const cached = window.localStorage.getItem("chat:lastPeerId");
      if (cached != null && !Number.isNaN(Number(cached))) return Number(cached);
    }
  } catch {}
  return null;
}

export default function UserChat({
  currentUserId,
  token,
  initialPeerId,
}) {
  const me = currentUserId != null ? Number(currentUserId) : null;

  const [selected, setSelected] = useState(null); // { peerId, conversationId?, peer? }
  const peerId = selected?.peerId ?? null;
  const conversationId = selected?.conversationId ?? null;

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [convRefreshTick, setConvRefreshTick] = useState(0);

  const processedRef = useRef(new Set());        // "id:XX" | "cid:YY"
  const lastIdsRef = useRef(new Set());          // ids vistos
  const lastClientIdsRef = useRef(new Set());    // client_ids vistos
  const mountedRef = useRef(true);
  const bootedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // Bootstrap: fija peerId al montar (prop / URL / localStorage)
  useEffect(() => {
    if (bootedRef.current) return;
    const pid = resolveInitialPeerId(initialPeerId);
    if (pid) {
      setSelected({ peerId: pid, conversationId: null, peer: null });
      try { window.localStorage.setItem("chat:lastPeerId", String(pid)); } catch {}
    }
    bootedRef.current = true;
  }, [initialPeerId]);

  const isMine = (sid) => me != null && sid != null && Number(sid) === me;

  // Normaliza a { id, client_id, sender_id, text, created_at, mine }
  const normalizeMsg = (raw) => {
    if (!raw) return null;
    const sid =
      raw?.sender_id != null ? Number(raw.sender_id)
      : raw?.sender?.id != null ? Number(raw.sender.id)
      : null;
    return {
      id: raw.id ?? null,
      client_id: raw.client_id ?? null,
      sender_id: sid,
      text: (raw.text ?? raw.content ?? "") + "",
      created_at: raw.created_at ?? raw.timestamp ?? null,
      mine: isMine(sid),
    };
  };

  // WS: sólo aceptamos mensajes del peer actual (entrantes o salientes)
  const onWsMessage = (msg) => {
    const normalized = normalizeMsg(msg);
    if (!normalized) return;

    const rec = msg?.recipient != null ? Number(msg.recipient) : null;
    const isForThisPeer =
      Number(normalized.sender_id) === Number(peerId) ||
      (rec != null && Number(rec) === Number(peerId));
    if (!isForThisPeer) return;

    const sidKey = normalized.id ? `id:${normalized.id}` : null;
    const cidKey = normalized.client_id ? `cid:${normalized.client_id}` : null;
    if (sidKey && processedRef.current.has(sidKey)) return;
    if (cidKey && processedRef.current.has(cidKey)) return;

    if (normalized.id) lastIdsRef.current.add(normalized.id);
    if (normalized.client_id) lastClientIdsRef.current.add(normalized.client_id);

    setHistory((prev) => [...prev, normalized]);

    if (sidKey) processedRef.current.add(sidKey);
    if (cidKey) processedRef.current.add(cidKey);
  };

  // Suscríbete al canal del usuario logueado (quien debe recibir)
  const { ready, sendPayload, resetLive } = useDMWebSocket({
    token,
    channelUserId: currentUserId,
    onMessage: onWsMessage,
  });

  async function fetchMessagesJSON(opts) {
    const base = API_BASE.replace(/\/+$/, "");
    const url = `${base}/api/chat/messages/?peer_id=${peerId}`;
    const res = await fetch(url, opts);
    const ctype = res.headers.get("content-type") || "";
    if (!res.ok || !ctype.includes("application/json")) {
      const body = await res.text();
      throw new Error(`GET ${url} -> ${res.status} ${ctype} ${body.slice(0,160)}`);
    }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  }

  // Carga de historial + polling visible cada 3s
  useEffect(() => {
    if (!token || !peerId) return;

    let ignore = false;
    const controller = new AbortController();
    let intervalId = null;

    const run = async () => {
      setLoading(true);
      try {
        const data = await fetchMessagesJSON({
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });
        if (!ignore && mountedRef.current) {
          const normalized = data.map(normalizeMsg).filter(Boolean);
          setHistory(normalized);

          // seed sets para evitar duplicados
          try {
            normalized.forEach((m) => {
              if (m?.id != null) { lastIdsRef.current.add(m.id); processedRef.current.add(`id:${m.id}`); }
              if (m?.client_id != null) { lastClientIdsRef.current.add(m.client_id); processedRef.current.add(`cid:${m.client_id}`); }
            });
          } catch {}
        }
      } catch {
        if (!ignore) setHistory([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    const canPoll = () =>
      typeof document === "undefined" || document.visibilityState === "visible";

    // reset antes de cargar
    processedRef.current.clear();
    lastIdsRef.current = new Set();
    lastClientIdsRef.current = new Set();
    setHistory([]);
    resetLive();

    run();

    // Polling cada 3s cuando la pestaña esté visible
    intervalId = setInterval(async () => {
      if (!canPoll()) return;
      try {
        const base = API_BASE.replace(/\/+$/, "");
        const res = await fetch(`${base}/api/chat/messages/?peer_id=${peerId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const ctype = res.headers.get("content-type") || "";
        if (!res.ok || !ctype.includes("application/json")) return;
        const data = await res.json();
        if (!Array.isArray(data)) return;

        const normalized = data
          .map((m) => normalizeMsg(m))
          .filter(Boolean)
          .filter((m) => {
            if (m.id && lastIdsRef.current.has(m.id)) return false;
            if (m.client_id && lastClientIdsRef.current.has(m.client_id)) return false;
            return true;
          });

        if (normalized.length > 0) {
          normalized.forEach((m) => {
            if (m.id) { lastIdsRef.current.add(m.id); processedRef.current.add(`id:${m.id}`); }
            if (m.client_id) { lastClientIdsRef.current.add(m.client_id); processedRef.current.add(`cid:${m.client_id}`); }
          });
          setHistory((prev) => [...prev, ...normalized]);
        }
      } catch {}
    }, 3000);

    return () => {
      ignore = true;
      controller.abort();
      if (intervalId) clearInterval(intervalId);
    };
  }, [token, peerId, conversationId, resetLive]);

  const handleSend = async (text) => {
    if (!text?.trim() || !peerId || currentUserId == null) return;

    const clientId = makeClientId();

    // Optimista
    setHistory((h) => [
      ...h,
      {
        id: null,
        client_id: clientId,
        sender_id: me,
        text,
        created_at: new Date().toISOString(),
        mine: true,
      },
    ]);
    if (clientId) {
      processedRef.current.add(`cid:${clientId}`);
      lastClientIdsRef.current.add(clientId);
    }

    // REST (crea conversación + mensaje)
    const base = API_BASE.replace(/\/+$/, "");
    try {
      const res = await fetch(`${base}/api/chat/messages/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ peer_id: peerId, text, client_id: clientId }),
      });
      const ctype = res.headers.get("content-type") || "";
      const bodyText = await res.clone().text();
      let msg = null;
      if (ctype.includes("application/json")) {
        try { msg = JSON.parse(bodyText); } catch {}
      }
      if (msg) {
        const normalized = normalizeMsg({ ...msg, client_id: clientId });
        if (normalized?.id) {
          processedRef.current.add(`id:${normalized.id}`);
          lastIdsRef.current.add(normalized.id);
        }
        setHistory((prev) => {
          const next = [...prev];
          const i = next.findIndex((m) => m.client_id === clientId);
          if (i >= 0) next[i] = normalized;
          else next.push(normalized);
          return next;
        });
        setConvRefreshTick((n) => n + 1);
      } else {
        console.warn("POST /messages/ no devolvió JSON:", res.status, ctype, bodyText?.slice?.(0, 180));
      }
    } catch (e) {
      console.warn("Error POST /messages/:", e);
    }

    // Empuje por WS (opcional). Incluye destinatario explícito.
    try {
      sendPayload({
        type: "message",     // o action: "send" según tu consumer
        text,
        client_id: clientId,
        peer_id: peerId,
        recipient: peerId,
      });
    } catch {}
  };

  return (
    <div className="w-full h-[540px] md:h-[580px] flex rounded-2xl overflow-hidden border border-[#f3d7cb]/60 shadow bg-gradient-to-b from-[#fff6f1] to-[#fdeee7]">
      <ListaConversacion
        token={token}
        activePeerId={peerId}
        refreshKey={convRefreshTick}
        onSelectPeer={(val) => {
          let pid = null, cid = null, peer = null;
          if (typeof val === "object" && val !== null) {
            pid = val.peerId ?? val.id ?? null;
            cid = val.conversationId ?? null;
            peer = val.peer ?? null;
          } else {
            pid = val ?? null;
          }
          if (pid) {
            setSelected({ peerId: pid, conversationId: cid, peer });
            try { window.localStorage.setItem("chat:lastPeerId", String(pid)); } catch {}
          }
        }}
      />
      <section className="flex-1 flex flex-col">
        {peerId ? (
          <>
            <div className="px-4 py-3 border-b border-[#f3d7cb]/60 bg-white/70 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-[#7d9a75]/20 ring-1 ring-[#7d9a75]/30" />
                <div className="font-semibold text-gray-800">
                  {selected?.peer?.nombre || "-"}
                </div>
              </div>
              <div className="text-xs text-gray-600 flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${ready ? "bg-[#7d9a75]" : "bg-amber-500"}`} />
                {ready ? "Conectado" : "Conectando…"}
              </div>
            </div>

            <div className="flex-1 min-h-0">
              <ListaMensajes messages={history} currentUserId={currentUserId} loading={loading} />
            </div>

            <InputMensaje onSend={handleSend} disabled={!peerId || !token} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-600">
            Selecciona una conversación para empezar a chatear.
          </div>
        )}
      </section>
    </div>
  );
}