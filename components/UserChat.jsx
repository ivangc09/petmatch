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

  const [selected, setSelected] = useState(null);
  const peerId = selected?.peerId ?? null;
  const conversationId = selected?.conversationId ?? null;

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [convRefreshTick, setConvRefreshTick] = useState(0);

  const processedRef = useRef(new Set());
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // Preselección por props o query (?peer=ID)
  useEffect(() => {
    const pidFromProp =
      initialPeerId != null && !Number.isNaN(Number(initialPeerId))
        ? Number(initialPeerId)
        : null;

    const pidFromQS = sp?.get?.("peer");
    const pid = pidFromProp ?? (pidFromQS != null ? Number(pidFromQS) : null);

    if (pid && !selected) {
      setSelected({ peerId: pid, conversationId: null, peer: null });
    }
  }, [sp, initialPeerId, selected]);

  const isMine = (sid) =>
    me != null && sid != null && Number(sid) === me;

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

  const { ready, sendPayload, resetLive } = useDMWebSocket({
    token,
    peerId,
    onMessage: onWsMessage,
  });

  async function fetchMessagesJSON(opts) {
    const base = API_BASE.replace(/\/+$/, "");
    const url = `${base}/api/chat/messages/?peer_id=${peerId}`;
    const res = await fetch(url, opts);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
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
      const msg = await res.json();
      const normalized = normalizeMsg({ ...msg, client_id: clientId });
      setHistory((prev) => {
        const next = [...prev];
        const i = next.findIndex((m) => m.client_id === clientId);
        if (i >= 0) next[i] = normalized;
        else next.push(normalized);
        return next;
      });
      setConvRefreshTick((n) => n + 1);
    } catch (e) {
      console.warn("Error POST /messages/:", e);
    }

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
            <div className="px-4 py-3 border-b border-[#f3d7cb]/60 bg-white/70 flex items-center justify-between">
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
