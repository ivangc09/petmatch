"use client";
import { useState } from "react";

export default function MessageInput({ onSend, disabled }) {

    const [text, setText] = useState("");

  const handle = () => {
    const t = text.trim();
    if (!t) return;
    onSend(t);
    setText("");
  };

  return (
    <div className="p-4 border-t bg-white">
      <div className="mx-auto max-w-3xl flex gap-2">
        <input
          value={text || ""}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handle()}
          placeholder="Escribe un mensaje…"
          className="flex-1 rounded-xl border px-4 py-3 outline-none focus:ring"
          disabled={disabled}
        />
        <button
          onClick={handle}
          disabled={disabled}
          className="rounded-xl px-5 py-3 bg-[#7d9a75] text-white hover:bg-[#607859] transition disabled:opacity-60"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}