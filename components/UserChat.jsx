"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function UserChat({ currentUserId, peerId, token }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("conectando…");
  const [mounted, setMounted] = useState(false);
  const wsRef = useRef(null);

  useEffect(() => setMounted(true), []);

  // ---- Abrir WebSocket ----
  useEffect(() => {
    if (!peerId || !token) return;

    const wsUrl = `${process.env.NEXT_PUBLIC_WS_BASE}/ws/chat/u/${peerId}/?token=${token}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => setStatus("en vivo");
    ws.onclose = () => setStatus("desconectado");
    ws.onerror = () => setStatus("error");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.action === "send") {
        // ignorar eco de mis propios mensajes
        if (Number(data.sender_id) === Number(currentUserId)) return;

        setMessages((prev) => {
          const already = prev.find((m) => m.id === data.id);
          if (already) return prev;
          return [...prev, data];
        });
      }
    };

    return () => ws.close();
  }, [peerId, token, currentUserId]);

  // ---- Polling fallback ----
  useEffect(() => {
    if (!peerId || !token) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/api/chat/${peerId}/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) return;
        const data = await res.json();

        setMessages((prev) => {
          const merged = [...prev];
          data.forEach((msg) => {
            const exists = merged.find((m) => m.id === msg.id);
            if (!exists) {
              // reemplazar optimista si coincide texto + tiempo cercano
              const optimist = merged.find(
                (m) =>
                  m.client_id &&
                  m.text === msg.text &&
                  Math.abs(new Date(m.created_at) - new Date(msg.created_at)) <
                    3000
              );
              if (optimist) {
                const idx = merged.indexOf(optimist);
                merged[idx] = msg;
              } else {
                merged.push(msg);
              }
            }
          });
          return merged;
        });
      } catch (err) {
        console.error("Polling error", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [peerId, token]);

  // ---- Enviar mensaje ----
  const sendMessage = async () => {
    if (!input.trim()) return;

    const clientId = crypto.randomUUID();
    const newMsg = {
      id: clientId, // temporal
      client_id: clientId,
      text: input,
      sender_id: currentUserId,
      created_at: new Date().toISOString(),
      optimist: true,
    };

    setMessages((prev) => [...prev, newMsg]);

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          action: "send",
          text: input,
          client_id: clientId,
        })
      );
    }

    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/chat/${peerId}/send/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text: input, client_id: clientId }),
        }
      );
    } catch (err) {
      console.error("POST error", err);
    }

    setInput("");
  };

  // ---- UI aislado con Portal ----
  const ChatUI = (
    <div
      className="pm-chat fixed bottom-6 right-6 z-[9999] w-[22rem] max-w-[92vw]
                 text-[14px] [color-scheme:light]"
    >
      <div className="bg-white/95 text-gray-900 border border-black/10 shadow-2xl rounded-2xl overflow-hidden backdrop-blur">
        {/* HEADER */}
        <div className="px-3 py-2 border-b border-black/10 flex items-center justify-between">
          <span className="text-sm font-medium">Chat</span>
          <span className="text-[11px] text-gray-500">{status}</span>
        </div>

        {/* BODY */}
        <div className="h-[340px] overflow-y-auto p-3 space-y-2 not-prose">
          {messages.map((m) => {
            const mine = Number(m.sender_id) === Number(currentUserId);
            return (
              <div
                key={m.id}
                className={`max-w-xs px-3 py-2 rounded-xl ${
                  mine
                    ? "ml-auto bg-[#e0795e] text-white"
                    : "mr-auto bg-gray-200 text-gray-900"
                }`}
              >
                <p>{m.text}</p>
              </div>
            );
          })}
        </div>

        {/* INPUT */}
        <div className="p-2 flex gap-2 border-t border-black/10">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 border rounded px-2 py-1 text-sm"
            placeholder="Escribe un mensaje…"
          />
          <button
            onClick={sendMessage}
            className="bg-[#e0795e] hover:bg-[#d3764c] text-white px-4 py-1 rounded"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );

  if (mounted) {
    return createPortal(ChatUI, document.body);
  }
  return null;
}
