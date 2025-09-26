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

/**
 * Props extra (opcionales) para abrir directo una conversación:
 * - initialPeerId: number | string
 */
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

  const onWsMessage = (msg) => {
    const sidNorm =
      msg?.sender_id != null ? Number(msg.sender_id)
      : msg?.sender?.id != null ? Number(msg.sender.id)
      : null;

    const sidKey = msg.id ? `id:${msg.id}` : null;
    const cidKey = msg.client_id ? `cid:${msg.client_id}` : null;
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

      if (msg.client_id && byCid.has(msg.client_id)) {
        const i = byCid.get(msg.client_id);
        next[i] = {
          ...next[i],
          id: msg.id,
          sender_id: sidNorm,
          text: msg.text,
          created_at: msg.created_at,
          mine: next[i].mine === true ? true : isMine(sidNorm),
          client_id: msg.client_id,
        };
      } else if (msg.id && byId.has(msg.id)) {
        const i = byId.get(msg.id);
        next[i] = {
          ...next[i],
          id: msg.id,
          sender_id: sidNorm,
          text: msg.text,
          created_at: msg.created_at,
          mine: isMine(sidNorm),
          client_id: msg.client_id ?? next[i]?.client_id,
        };
      } else {
        next.push({
          id: msg.id,
          sender_id: sidNorm,
          text: msg.text,
          created_at: msg.created_at,
          mine: isMine(sidNorm),
          client_id: msg.client_id,
        });
      }

      if (sidKey) processedRef.current.add(sidKey);
      if (cidKey) processedRef.current.add(cidKey);

      return next;
    });
  };

const ensuredRef = useRef(new Set());

async function ensureConversationIfNeeded() {
  if (!peerId || !token) return false;
  const key = String(peerId);
  if (ensuredRef.current.has(key)) return true;

  const base = API_BASE.replace(/\/+$/, "");
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const tries = [
    // 1) endpoint explícito de "ensure"
    { url: `${base}/api/chat/conversations/ensure/`, body: { peer_id: peerId } },
    // 2) a veces lo llaman "start"
    { url: `${base}/api/chat/conversations/start/`, body: { peer_id: peerId } },
    // 3) crear conversación con POST al listado
    { url: `${base}/api/chat/conversations/`, body: { peer_id: peerId } },
  ];

  for (const t of tries) {
    try {
      const res = await fetch(t.url, { method: "POST", headers, body: JSON.stringify(t.body) });
      if (res.ok) {
        ensuredRef.current.add(key);
        return true;
      }
      // 409 ya existe también es “ok” para nosotros
      if (res.status === 409) {
        ensuredRef.current.add(key);
        return true;
      }
      // log útil en dev
      const ctype = res.headers.get("content-type") || "";
      const body = ctype.includes("json") ? await res.json() : await res.text();
      console.warn("ensureConversation fail:", t.url, res.status, body);
    } catch (e) {
      console.warn("ensureConversation error:", t.url, e);
    }
  }
  return false;
}

async function restSendMessage(text, clientId) {
  if (!peerId || !token) return false;
  const base = API_BASE.replace(/\/+$/, "");
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const tries = [
    // 1) endpoint típico de mensajes
    { url: `${base}/api/chat/messages/`, body: { peer_id: peerId, text, client_id: clientId } },
    // 2) variantes comunes
    { url: `${base}/api/chat/send/`, body: { peer_id: peerId, text, client_id: clientId } },
    { url: `${base}/api/chat/message/`, body: { peer_id: peerId, text, client_id: clientId } },
  ];

  for (const t of tries) {
    try {
      const res = await fetch(t.url, { method: "POST", headers, body: JSON.stringify(t.body) });
      const ctype = res.headers.get("content-type") || "";
      if (res.ok && ctype.includes("application/json")) {
        const msg = await res.json();
        // reconciliar con el optimista
        setHistory((prev) => {
          const next = [...prev];
          const i = next.findIndex((m) => m.client_id === clientId);
          const sid =
            msg?.sender_id != null ? Number(msg.sender_id)
            : msg?.sender?.id != null ? Number(msg.sender.id)
            : Number(currentUserId);
          const merged = {
            id: msg.id ?? next[i]?.id ?? null,
            client_id: clientId,
            sender_id: sid,
            text: msg.text ?? text,
            created_at: msg.created_at ?? new Date().toISOString(),
            mine: true,
          };
          if (i >= 0) next[i] = merged;
          else next.push(merged);
          return next;
        });
        return true;
      }
      // log para depurar
      const body = ctype.includes("json") ? await res.json() : await res.text();
      console.warn("restSendMessage fail:", t.url, res.status, body);
    } catch (e) {
      console.warn("restSendMessage error:", t.url, e);
    }
  }
  return false;
}
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
          return await res.json();
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

        const arr = Array.isArray(data) ? data : [];
        setHistory(
          arr.map((m) => {
            const sid =
              m?.sender_id != null ? Number(m.sender_id)
              : m?.sender?.id != null ? Number(m.sender.id)
              : null;
            return { ...m, sender_id: sid };
          })
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

  // mensaje optimista
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

  // 1) asegurar/crear conversación si hace falta
  await ensureConversationIfNeeded();

  // 2) intentar por WS
  const wsOK = sendPayload({ type: "message", text, client_id: clientId });

  // 3) si WS no está listo o no envió, intentar por REST
  if (!wsOK) {
    const restOK = await restSendMessage(text, clientId);
    if (!restOK) {
      console.error("No se pudo enviar el mensaje ni por WS ni por REST");
    }
  }
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

            {/* Input */}
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
