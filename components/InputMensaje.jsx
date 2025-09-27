"use client";
import { useState } from "react";

export default function InputMensaje({ onSend, disabled }) {
  const [text, setText] = useState("");

  const handle = () => {
    const t = text.trim();
    if (!t) return;
    onSend(t);
    setText("");
  };

  return (
    <div
      className="
        sticky bottom-0
        p-3 md:p-4 border-t border-[#f3d7cb]/60
        bg-white/75 backdrop-blur supports-[backdrop-filter]:bg-white/65
      "
    >
      <div className="mx-auto max-w-5xl flex justify-between gap-2">
        <input
          value={text || ""}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handle()}
          placeholder="Escribe tu mensaje…"
          className="
            flex-1 rounded-full border border-[#f3d7cb]/70 bg-white/80
            px-4 py-3 outline-none
            focus:ring-2 focus:ring-[#f3d7cb]/80
            placeholder:text-gray-400
          "
          disabled={disabled}
        />
        <button
          onClick={handle}
          disabled={disabled}
          className="
            rounded-full px-5 py-3
            bg-[#7d9a75] text-white
            hover:bg-[#607859] transition
            disabled:opacity-60 disabled:cursor-not-allowed
            shadow-[0_8px_20px_rgba(125,154,117,.25)]
          "
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
