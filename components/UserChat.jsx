"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
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

export default function UserChat({
  currentUserId,
  token,
  initialPeerId,
}) {
  const me = currentUserId != null ? Number(currentUserId) : null;
  const sp = useSearchParams();

  const [selected, setSelected] = useState(null); // { peerId, conversationId?, peer? }
  const peerId = selected?.peerId ?? null;
  const conversationId = selected?.conversationId ?? null;

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const processedRef = useRef(new Set());
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // Preseleccionar peer solo por props o query (?peer=ID)
  useEffect(() => {
    const pidFromProp =
      initialPeerId != null && !Number.isNaN(Number(initialPeerId))
        ? Number(initialPeerId)
        : null;

    const pidFromQS = sp?.get?.("peer");
    const pid = pidFromProp ?? (pidFromQS != null ? Number(pidFromQS) : null);

    if (pid && !selected) {
      setSelected({
        peerId: pid,
        conversationId: null,
        peer: null,
      });
    }
  }, [sp, initialPeerId, selected]);

  const isMine = (senderIdRaw) => {
    const sid = senderIdRaw != null ? Number(senderIdRaw) : null;
    const meNum = currentUserId != null ? Number(currentUserId) : null;
    return meNum != null && sid === meNum;
  };

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
      text: raw.text ?? raw.content ?? "",
      created_at: raw.created_at ?? raw.timestamp ?? raw.date ?? null,
      mine: isMine(sid),
    };
  };

  const onWsMessage = (msg) => {
    // Mapear también cuando viene por WS
    const normalized = normalizeMsg(msg);
    if (!normalized) return;

    const sidKey = normalized.id ? `id:${normalized.id}` : null;
    const cidKey = normalized.client_id ? `cid:${normalized.client_id}` : null;
    if (sidKey && processedRef.current.has(sidKey)) return;
    if (cidKey && processedRef.current.has(cidKey)) return;

    setHistory((prev) => {
      const byCid = new Map();
      const byId = new Map();
      prev.forEach((m, idx) => {
        if (m.client_id) byCid.set(m.client_id, idx);
        if (m.id) byId.set(m.id, idx);
      });

      const next = [...prev];

      if (normalized.client_id && byCid.has(normalized.client_id)) {
        const i = byCid.get(normalized.client_id);
        next[i] = {
          ...next[i],
          id: normalized.id ?? next[i].id,
          sender_id: normalized.sender_id ?? next[i].sender_id,
          text: normalized.text ?? next[i].text,
          created_at: normalized.created_at ?? next[i].created_at,
          mine: next[i].mine === true ? true : normalized.mine,
          client_id: normalized.client_id,
        };
      } else if (normalized.id && byId.has(normalized.id)) {
        const i = byId.get(normalized.id);
        next[i] = {
          ...next[i],
          id: normalized.id,
          sender_id: normalized.sender_id ?? next[i].sender_id,
          text: normalized.text ?? next[i].text,
          created_at: normalized.created_at ?? next[i].created_at,
          mine: normalized.mine,
          client_id: normalized.client_id ?? next[i]?.client_id,
        };
      } else {
        next.push(normalized);
      }

      if (sidKey) processedRef.current.add(sidKey);
      if (cidKey) processedRef.current.add(cidKey);

      return next;
    });
  };

  // El hook usa su default interno de WS base; no pasamos baseWs para evitar TDZ
  const { ready, sendPayload, resetLive } = useDMWebSocket({
    token,
    peerId,
    onMessage: onWsMessage,
  });

  async function fetchMessagesJSON(opts) {
    const base = API_BASE.replace(/\/+$/, "");
    const urls = [];
    if (peerId != null) {
      urls.push(`${base}/api/chat/messages/?peer_id=${peerId}`);
    }
    if (conversationId) {
      urls.push(`${base}/api/chat/messages/?conversation_id=${conversationId}`);
    }
    urls.push(`${base}/api/chat/messages/`);

    for (const url of urls) {
      try {
        const res = await fetch(url, opts);
        const ctype = res.headers.get("content-type") || "";
        if (res.ok && ctype.includes("application/json")) {
          const data = await res.json();
          return Array.isArray(data) ? data : [];
        }
        const body = await res.text();
        console.error("Messages try failed:", url, res.status, res.statusText, ctype, body.slice(0, 200));
      } catch (e) {
        console.error("Messages try error:", e);
      }
    }
    throw new Error("No valid /messages/ variant returned JSON");
  }

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

        if (ignore || !mountedRef.current) return;

        // Normaliza historial recibido (content/timestamp → text/created_at)
        setHistory(
          data.map((m) => normalizeMsg(m)).filter(Boolean)
        );
      } catch (e) {
        if (!ignore) {
          console.error("Messages fetch error (all variants failed):", e);
          setHistory([]);
        }
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

    // 1) Mensaje optimista
    setHistory((h) => [
      ...h,
      {
        id: null,
        client_id: clientId,
        sender_id: Number(currentUserId),
        text,
        created_at: new Date().toISOString(),
        mine: true,
      },
    ]);

    // 2) PRIMERO por REST (esto crea la conversación)
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
      if (res.ok && ctype.includes("application/json")) {
        const msg = await res.json();
        // 2.1 Reconciliar optimista con respuesta del server
        setHistory((prev) => {
          const next = [...prev];
          const i = next.findIndex((m) => m.client_id === clientId);
          const normalized = normalizeMsg({ ...msg, client_id: clientId }) || {
            id: msg.id ?? next[i]?.id ?? null,
            client_id: clientId,
            sender_id:
              msg?.sender_id != null ? Number(msg.sender_id)
              : msg?.sender?.id != null ? Number(msg.sender.id)
              : Number(currentUserId),
            text: msg.text ?? msg.content ?? text,
            created_at: msg.created_at ?? msg.timestamp ?? new Date().toISOString(),
            mine: true,
          };
          if (i >= 0) next[i] = normalized;
          else next.push(normalized);
          return next;
        });
      } else {
        const body = ctype.includes("json") ? await res.json() : await res.text();
        console.warn("POST /messages/ falló:", res.status, body);
      }
    } catch (e) {
      console.warn("Error POST /messages/:", e);
    }

    // 3) SI el WS está listo, envía también por WS (opcional, sólo para “empujar” realtime)
    try {
      sendPayload({ type: "message", text, client_id: clientId });
    } catch {}
  };

  return (
    <div
      className="
        w-full h-[540px] md:h-[580px] flex rounded-2xl overflow-hidden
        border border-[#f3d7cb]/60 shadow-[0_10px_30px_rgba(0,0,0,.06)]
        bg-gradient-to-b from-[#fff6f1] to-[#fdeee7]
      "
    >
      <ListaConversacion
        token={token}
        activePeerId={peerId}
        onSelectPeer={(val) => {
          if (typeof val === "object" && val !== null) {
            setSelected({
              peerId: val.peerId ?? val.id ?? null,
              conversationId: val.conversationId ?? null,
              peer: val.peer ?? null,
            });
          } else {
            setSelected({ peerId: val ?? null, conversationId: null, peer: null });
          }
        }}
      />

      <section className="flex-1 flex flex-col">
        {peerId ? (
          <>
            {/* Header translúcido con blur */}
            <div
              className="
                px-4 py-3 border-b border-[#f3d7cb]/60 bg-white/70
                backdrop-blur supports-[backdrop-filter]:bg-white/60
                flex items-center justify-between
              "
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-[#7d9a75]/20 ring-1 ring-[#7d9a75]/30" />
                <div className="font-semibold text-gray-800">
                  Conversación con Usuario #{peerId}
                </div>
              </div>
              <div className="text-xs text-gray-600 flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${
                    ready ? "bg-[#7d9a75]" : "bg-amber-500"
                  }`}
                />
                {ready ? "Conectado" : "Conectando…"}
              </div>
            </div>

            {/* Mensajes */}
            <div className="flex-1 min-h-0">
              <ListaMensajes messages={history} currentUserId={currentUserId} loading={loading} />
            </div>

            {/* Input — no depende del estado WS */}
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
