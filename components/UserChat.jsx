"use client";

import { useEffect, useRef, useState } from "react";
import ListaConversacion from "./ListaConversacion";
import ListaMensajes from "./ListaMensajes";
import InputMensaje from "./InputMensaje";
import useDMWebSocket from "@/hooks/useDMWebSocket";

const DEFAULT_WS =
  (typeof window !== "undefined" && process.env.NEXT_PUBLIC_WS_BASE) ||
  "ws://localhost:8001";

const API_BASE =
  (typeof window !== "undefined" && process.env.NEXT_PUBLIC_API_BASE) ||
  "http://localhost:8000";

function makeClientId() {
  return `c_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export default function UserChat({
  currentUserId,
  token,
  baseWs = DEFAULT_WS,
}) {
  const me = currentUserId != null ? Number(currentUserId) : null;

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

  const isMine = (senderIdRaw) => {
    const sid = senderIdRaw != null ? Number(senderIdRaw) : null;
    const meNum = currentUserId != null ? Number(currentUserId) : null;
    return meNum != null && sid === meNum;
  };

  // === WS: integrar cada mensaje que llegue (callback directo) ===
  const onWsMessage = (msg) => {
    // normaliza remitente
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

      // reemplazo por client_id (optimista → definitivo)
      if (msg.client_id && byCid.has(msg.client_id)) {
        const i = byCid.get(msg.client_id);
        next[i] = {
          ...next[i],
          id: msg.id,
          sender_id: sidNorm,
          text: msg.text,
          created_at: msg.created_at,
          mine: next[i].mine ?? isMine(sidNorm),
          client_id: msg.client_id,
        };
      } else if (msg.id && byId.has(msg.id)) {
        // reemplazo por id
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
        // nuevo mensaje
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

  const { ready, sendPayload, resetLive } = useDMWebSocket({
    baseWs,
    token,
    peerId,
    onMessage: onWsMessage, // ← clave
  });

  // === Cargar historial desde /messages/ (ajustado a tus urls) ===
  async function fetchMessagesJSON(opts) {
    const base = API_BASE.replace(/\/+$/, "");
    const urls = [];
    if (peerId != null) {
      urls.push(`${base}/api/chat/messages/?peer_id=${peerId}`);
      urls.push(`${base}/api/chat/messages/?peer=${peerId}`);
      urls.push(`${base}/api/chat/messages/?user=${peerId}`);
    }
    if (conversationId) {
      urls.push(`${base}/api/chat/messages/?conversation_id=${conversationId}`);
    }
    urls.push(`${base}/api/chat/messages/`); // fallback

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
            return { ...m, sender_id: sid, mine: isMine(sid) };
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

  const handleSend = (text) => {
    if (!text?.trim() || !peerId) return;
    const clientId = makeClientId();
    setHistory((h) => [
      ...h,
      {
        id: null,
        client_id: clientId,
        sender_id: me != null ? Number(me) : -1,
        text,
        created_at: new Date().toISOString(),
        mine: true,
      },
    ]);
    sendPayload({ type: "message", text, client_id: clientId });
  };

  // ======== HTML/JSX SIN CAMBIOS ========
  return (
    <div className="w-full h-[520px] flex bg-white rounded-xl overflow-hidden border">
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
            <div className="px-4 py-3 border-b bg-[#fff6f1] flex items-center justify-between">
              <div className="font-semibold text-gray-800">
                Conversación con usuario #{peerId}
              </div>
              <div className="text-xs text-gray-500">
                {ready ? "Conectado" : "Conectando…"}
              </div>
            </div>
            <div className="flex-1 min-h-0">
              <ListaMensajes messages={history} currentUserId={currentUserId} />
            </div>
            <InputMensaje onSend={handleSend} disabled={!ready} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Elige una conversación para empezar a chatear.
          </div>
        )}
      </section>
    </div>
  );
}
