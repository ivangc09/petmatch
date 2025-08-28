"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import ListaConversacion from "./ListaConversacion";
import ListaMensajes from "./ListaMensajes";
import InputMensaje from "./InputMensaje";
import useDMWebSocket from "@/hooks/useDMWebSocket";

// WS base por defecto (puedes sobreescribir con NEXT_PUBLIC_WS_BASE)
const DEFAULT_WS =
  (typeof window !== "undefined" && process.env.NEXT_PUBLIC_WS_BASE) ||
  "ws://localhost:8001";

export default function UserChat({
  currentUserId,               // ID del usuario autenticado
  token,                        // JWT para REST
  baseWs = DEFAULT_WS,          // ws:// o wss://
  initialPeer = null,           // { id, nombre, avatar } opcional
}) {
  const [peer, setPeer] = useState(initialPeer);

  // Normaliza peer por si ListaConversacion envía {peer:{...}} en lugar de {id,...}
  const normalizedPeer = useMemo(() => {
    if (!peer) return null;
    if (typeof peer?.id !== "undefined") return peer;
    if (peer?.peer && typeof peer.peer.id !== "undefined") return peer.peer;
    return null;
  }, [peer]);

  const peerId = normalizedPeer?.id ?? null;
  const [history, setHistory] = useState([]);

  const { ready, liveMessages, sendPayload, resetLive } = useDMWebSocket({
    baseWs,
    token,
    peerId,
  });

  // helper: ¿es mío este mensaje? (coerción a número y fallbacks defensivos)
  const isMine = (senderIdRaw) => {
    const sid = senderIdRaw != null ? Number(senderIdRaw) : null;
    const me  = currentUserId != null ? Number(currentUserId) : null;
    const pid = peerId != null ? Number(peerId) : null;

    if (me != null) return sid === me;
    if (pid != null) return sid != null ? sid !== pid : false; // si no conozco mi id aún
    return false;
  };

  // Cargar historial cuando cambia la conversación
  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();

    resetLive();
    setHistory([]);

    if (!token || !peerId) {
      return () => {
        ignore = true;
        controller.abort();
      };
    }

    (async () => {
      try {
        // ⬇️ corregido el esquema y usando template literal
        const res = await fetch(
          `http://localhost:8000/api/chat/messages/?peer_id=${peerId}&limit=50`,
          { headers: { Authorization: `Bearer ${token}` }, signal: controller.signal }
        );
        const data = await res.json();
        if (!ignore) setHistory(Array.isArray(data) ? data : []);
      } catch {
        if (!ignore) setHistory([]);
      }
    })();

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [token, peerId, resetLive]);

  // Marcar leídos al abrir conversación
  useEffect(() => {
    if (!token || !peerId) return;
    fetch("http://localhost:8000/api/chat/read/", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ peer_id: peerId }),
    }).catch(() => {});
  }, [token, peerId]);

  // De-duplicación: sustituye optimista por eco (client_id) o por texto (fallback)
  const processedRef = useRef(new Set());
  const lastCountRef = useRef(0);

  useEffect(() => {
    if (!liveMessages?.length || liveMessages.length === lastCountRef.current) return;
    lastCountRef.current = liveMessages.length;

    // índices rápidos del historial actual
    const byCid = new Map();
    const byId = new Map();
    history.forEach((m, idx) => {
      if (m.client_id) byCid.set(m.client_id, idx);
      if (m.id) byId.set(m.id, idx);
    });

    let changed = false;
    const next = [...history];

    for (const msg of liveMessages) {
      const sidKey = msg.id ? `id:${msg.id}` : null;
      const cidKey = msg.client_id ? `cid:${msg.client_id}` : null;

      if (sidKey && processedRef.current.has(sidKey)) continue;
      if (cidKey && processedRef.current.has(cidKey)) continue;

      // 1) Reemplazo por client_id (optimista → definitivo)
      if (msg.client_id && byCid.has(msg.client_id)) {
        const i = byCid.get(msg.client_id);
        next[i] = {
          ...next[i],
          id: msg.id,
          sender_id: msg.sender_id,
          text: msg.text,
          created_at: msg.created_at,
          mine: isMine(msg.sender_id),
          client_id: msg.client_id,
        };
        changed = true;
        if (sidKey) processedRef.current.add(sidKey);
        if (cidKey) processedRef.current.add(cidKey);
        continue;
      }

      // 2) Si ya existe por id, ignora
      if (msg.id && byId.has(msg.id)) {
        if (sidKey) processedRef.current.add(sidKey);
        if (cidKey) processedRef.current.add(cidKey);
        continue;
      }

      // 3) Fallback: emparejar con el último optimista "c-*" por texto (ventana corta)
      if (!msg.client_id) {
        const now = Date.now();
        for (let k = next.length - 1; k >= 0; k--) {
          const m = next[k];
          if (typeof m.id === "string" && m.id.startsWith("c-")) {
            const ageMs = Math.abs(now - new Date(m.created_at).getTime());
            if (m.text === msg.text && ageMs < 8000) {
              next[k] = {
                ...m,
                id: msg.id,
                sender_id: msg.sender_id,
                created_at: msg.created_at,
                mine: isMine(msg.sender_id),
                client_id: msg.client_id || m.client_id,
              };
              changed = true;
              if (sidKey) processedRef.current.add(sidKey);
              if (cidKey) processedRef.current.add(cidKey);
              break;
            }
          }
        }
        if (changed) continue;
      }

      // 4) Mensaje realmente nuevo → agregar
      next.push({
        id: msg.id,
        sender_id: msg.sender_id,
        text: msg.text,
        created_at: msg.created_at,
        mine: isMine(msg.sender_id),
        client_id: msg.client_id,
      });
      changed = true;
      if (sidKey) processedRef.current.add(sidKey);
      if (cidKey) processedRef.current.add(cidKey);
    }

    if (changed) setHistory(next);
  }, [liveMessages, history, currentUserId, peerId]);

  const messages = useMemo(() => history, [history]);

  // Envío optimista con client_id
  const handleSend = (text) => {
    const t = (text || "").trim();
    if (!t) return;

    const clientId = `c-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    setHistory((h) => [
      ...h,
      {
        id: clientId,
        client_id: clientId,
        sender_id: currentUserId ?? -1,
        text: t,
        created_at: new Date().toISOString(),
        mine: true,
      },
    ]);

    sendPayload({ type: "message", text: t, client_id: clientId });
  };

  return (
    <div className="flex min-h-[520px] border rounded-xl overflow-hidden bg-white shadow-sm">
      {/* Sidebar */}
      <ListaConversacion
        token={token}
        activePeerId={peerId}
        onSelectPeer={(p) => {
          // Normaliza al seleccionar, por si viene {peer:{...}}
          const np = p?.id != null ? p : p?.peer || null;
          processedRef.current.clear();
          lastCountRef.current = 0;
          setPeer(np);
        }}
      />

      {/* Panel */}
      <section className="flex-1 flex flex-col">
        {/* Header del peer */}
        <div className="p-4 border-b flex items-center gap-3 bg-white">
          {normalizedPeer ? (
            <>
              <div>
                <p className="font-semibold text-[#2b3136]">
                  {normalizedPeer?.nombre || `Usuario ${peerId}`}
                </p>
                <p className="text-xs text-gray-500">
                  {ready ? "Conectado" : "Conectando…"}
                </p>
              </div>
            </>
          ) : (
            <p className="text-gray-600">Selecciona una conversación</p>
          )}
        </div>

        {/* Mensajes + Input */}
        {normalizedPeer ? (
          <>
            <ListaMensajes
              messages={messages}
              currentUserId={currentUserId}
              peerId={peerId}
            />
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
