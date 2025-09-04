"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { MessageCircle, X, Minus, Send, Loader2,Image } from "lucide-react";

export default function ChatWidget({
  brand = "PawConnect",
  subtitle = "Asistente",
  accent = "#7d9a75",
  accentHover = "#607859",
  textColor = "#2b3136",
  gradientFrom = "#fff6f1",
  gradientTo = "#fdeee7",
  messages = [],          
  loading = false,        
  onSend,                 
  initialOpen = false,
  onImage,
}) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(initialOpen);
  const [input, setInput] = useState("");
  const [unread, setUnread] = useState(0);

  const listRef = useRef(null);

  useEffect(() => setMounted(true), []);

  // scroll al fondo si está abierto y llegan mensajes
  useEffect(() => {
    if (open && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
      setUnread(0);
    }
  }, [messages, open]);

  // si llegan mensajes estando cerrado, aumentar no leídos
  const prevCountRef = useRef(messages.length);
  useEffect(() => {
    if (!open && messages.length > prevCountRef.current) {
      setUnread((u) => Math.min(u + (messages.length - prevCountRef.current), 99));
    }
    prevCountRef.current = messages.length;
  }, [messages.length, open]);

  const accentStyle = useMemo(() => ({ backgroundColor: accent, color: "white" }), [accent]);
  if (!mounted) return null;

  function handleSubmit(e) {
    e?.preventDefault?.();
    const value = input.trim();
    if (!value) return;
    onSend?.(value); 
    setInput("");
  }

  function handleSuggestion(s) {
    setInput(s);
    // envía de una:
    setTimeout(() => handleSubmit(), 0);
  }

  return createPortal(
    <div className="fixed bottom-4 right-4 z-[9999]">
      {/* Pestañita cuando está cerrado */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="group flex items-center gap-2 rounded-full shadow-xl pl-4 pr-3 py-2 bg-white text-[#2b3136] active:scale-95"
        >
          <span className="hidden sm:inline text-sm font-medium">Chat {brand}</span>
          <span className="relative rounded-full p-2 text-white transition-opacity group-hover:opacity-90" style={accentStyle}>
            <MessageCircle size={18} />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] leading-none px-1.5 py-0.5 rounded-full">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </span>
        </button>
      )}

      {/* Ventana */}
      {open && (
        <div className="w-[92vw] max-w-[380px] h-[70vh] sm:h-[520px] rounded-2xl overflow-hidden shadow-2xl border border-[#f3d7cb] bg-white grid grid-rows-[auto_1fr_auto]">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-[#f3d7cb]">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-9 w-9 rounded-full flex items-center justify-center shadow shrink-0" style={accentStyle}>🐾</div>
              <div className="leading-tight truncate">
                <div className="font-semibold truncate" style={{ color: textColor }}>{brand}</div>
                <div className="text-xs text-neutral-500">{subtitle}</div>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0 pr-1">
              <button className="p-2 rounded-lg hover:opacity-80" title="Minimizar" onClick={() => setOpen(false)} style={{ color: textColor }}>
                <Minus size={18} />
              </button>
              <button className="p-2 rounded-lg hover:opacity-80" title="Cerrar" onClick={() => setOpen(false)} style={{ color: textColor }}>
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Lista de mensajes */}
          <div
      ref={listRef}
      className="overflow-y-auto px-3 py-3 space-y-3"
      style={{ background: `linear-gradient(180deg, ${gradientFrom}, ${gradientTo})` }}
    >
      {messages.map((m) => (
        <Bubble key={m.id} role={m.role} text={m.text} ts={m.ts} accent={accent} textColor={textColor} />
      ))}
      {loading && (
        <div className="flex justify-start">
          <div className="max-w-[70%] rounded-2xl px-3 py-2 text-sm shadow bg-white border border-[#f3d7cb] text-[#2b3136] flex items-center gap-2">
            <Loader2 className="animate-spin" size={14} />
            Escribiendo…
          </div>
        </div>
      )}
    </div>
    {/* Input */}
    <form onSubmit={handleSubmit} className="p-3 flex justify-between items-center gap-2 bg-white border-t border-[#f3d7cb]">
      <textarea
        rows={1}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Escribe tu mensaje..."
        className="flex-1 max-w-[290px] resize-none rounded-xl px-3 py-2 outline-none focus:ring-2 border border-[#f3d7cb]"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
      />
      <label htmlFor="file-upload"
        className="h-10 w-10 rounded-xl flex items-center justify-center shadow transition-colors"
        style={{ backgroundColor: "#d0764d", color: "white" }}>
        <Image size={18} />
      </label>

      <input
        id="file-upload"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && onImage) onImage(file);
          e.target.value = null;
        }}
      />

      <button
        type="submit"
        className="h-10 w-10 rounded-xl flex items-center justify-center shadow transition-colors"
        style={{ backgroundColor: accent, color: "white" }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = accentHover)}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = accent)}
      >
        <Send size={18} />
      </button>
    </form>
  </div>
  )}
    </div>,
    document.body
  );
}

function Bubble({ role, text, ts, accent, textColor }) {
  const isUser = role === "user";
  if (!String(text || "").trim()) return null;

  return (
    <div className={"flex " + (isUser ? "justify-end" : "justify-start")}>
      <div
        className={"max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow " + (isUser ? "rounded-br-sm" : "rounded-bl-sm")}
        style={{
          backgroundColor: isUser ? accent : "white",
          color: isUser ? "white" : textColor,
          border: isUser ? "none" : "1px solid #f3d7cb",
          wordBreak: "break-word",
        }}
      >
        <div className="whitespace-pre-wrap leading-relaxed">{text}</div>
        {ts && (
          <div className="mt-1 text-[10px] opacity-70">
            {new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
        )}
      </div>
    </div>
  );
}
