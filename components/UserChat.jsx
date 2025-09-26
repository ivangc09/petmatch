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

/** Intenta obtener peerId desde varias fuentes (prop, URL, localStorage) */
function resolveInitialPeerId(initialPeerIdProp) {
  // 1) Prop explícito
  if (initialPeerIdProp != null && !Number.isNaN(Number(initialPeerIdProp))) {
    return Number(initialPeerIdProp);
  }
  // 2) URL (?peer=)
  try {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const pid = sp.get("peer");
      if (pid != null && !Number.isNaN(Number(pid))) {
        return Number(pid);
      }
    }
  } catch {}
  // 3) Fallback localStorage (por si lo guardaste al dar clic en “Enviar mensaje”)
  try {
    if (typeof window !== "undefined") {
      const cached = window.localStorage.getItem("chat:lastPeerId");
      if (cached != null && !Number.isNaN(Number(cached))) {
        return Number(cached);
      }
    }
  } catch {}
  return null;
}

export default function UserChat({
  currentUserId,
  token,
  initialPeerId, // <- usa esto si montas desde un perfil
}) {
  const me = currentUserId != null ? Number(currentUserId) : null;

  const [selected, setSelected] = useState(null); // { peerId, conversationId?, peer? }
  const peerId = selected?.peerId ?? null;
  const conversationId = selected?.conversationId ?? null;

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [convRefreshTick, setConvRefreshTick] = useState(0);

  const processedRef = useRef(new Set());
  const mountedRef = useRef(true);
  const bootedRef = useRef(false); // para evitar re-bootstrap múltiples

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // Bootstrap super-defensivo: fija peerId apenas montas
  useEffect(() => {
    if (bootedRef.current) return; // corre solo una vez
    const pid = resolveInitialPeerId(initialPeerId);
    if (pid) {
      setSelected({ peerId: pid, conversationId: null, peer: null });
      try { window.localStorage.setItem("chat:lastPeerId", String(pid)); } catch {}
    }
    bootedRef.current = true;
  }, [initialPeerId]);

  const isMine = (sid) =>
    me != null && sid != null && Number(sid) === me;

  // Normaliza un mensaje a { id, client_id, sender_id, text, created_at, mine }
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

  const onWsMessage = (msg) => {
    const normalized = normalizeMsg(msg);
    if (!normalized) return;

    const sidKey = normalized.id ? `id:${normalized.id}` : null;
    const cidKey = normalized.client_id ? `cid:${normalized.client_id}` : null;
    if (sidKey && processedRef.current.has(sidKey)) return;
    if (cidKey && processedRef.current.has(cidKey)) return;

    setHistory((prev) => [...prev, normalized]);
    if (sidKey) processedRef.current.add(sidKey);
    if (cidKey) processedRef.current.add(cidKey);
  };

  // Hook WS (usa default interno para la URL base)
  const { ready, sendPayload, resetLive } = useDMWebSocket({
    token,
    peerId,
    onMessage: onWsMessage,
  });

  async function fetchMessagesJSON(opts) {
    const base = API_BASE.replace(/\/+$/, "");
    const url = `${base}/api/chat/messages/?peer_id=${peerId}`;
    const res = await fetch(url, opts);
    const ctype = res.headers.get("content-type") || "";
    if (!res.ok || !ctype.includes("application/json")) {
      const body = await res.text();
      throw new Error(`GET ${url} -> ${res.status} ${ctype} ${body.slice(0,180)}`);
    }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  }

  // Carga de historial cada vez que cambie peerId/token
  useEffect(() => {
    if (!token || !peerId) return;

    let ignore = false;
    const controller = new AbortController();

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
          setHistory(data.map(normalizeMsg).filter(Boolean));
        }
      } catch (e) {
        if (!ignore) setHistory([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    processedRef.current.clear();
    setHistory([]);
    resetLive();
    run();

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [token, peerId, conversationId, resetLive]);

  const handleSend = async (text) => {
    if (!text?.trim() || !peerId || currentUserId == null) return;

    const clientId = makeClientId();
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
        setHistory((prev) => {
          const next = [...prev];
          const i = next.findIndex((m) => m.client_id === clientId);
          if (i >= 0) next[i] = normalized;
          else next.push(normalized);
          return next;
        });
        setConvRefreshTick((n) => n + 1);
      } else {
        console.warn("POST /messages/ no devolvió JSON:", res.status, ctype, bodyText?.slice?.(0, 200));
      }
    } catch (e) {
      console.warn("Error POST /messages/:", e);
    }

    // Empuje WS opcional
    try {
      sendPayload({ type: "message", text, client_id: clientId });
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
                  Conversación con Usuario #{peerId}
                </div>
              </div>
              <div className="text-xs text-gray-600 flex items-center gap-2">
                {/* Indicador WS (informativo) */}
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
