"use client";
import React from "react";

export default function ListaMensajes({ messages, currentUserId, peerId }) {
  const me  = currentUserId != null ? Number(currentUserId) : null;
  const pid = peerId != null ? Number(peerId) : null;

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#fef2ec]">
      {messages.map((m) => {
        const sid =
          m?.sender_id != null
            ? Number(m.sender_id)
            : m?.sender?.id != null
            ? Number(m.sender.id)
            : null;

        const mine =
          m?.mine === true
            ? true
            : me != null
            ? sid === me
            : pid != null
            ? sid != null && sid !== pid
            : false;

        return (
          <div key={String(m.id)} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[70%] rounded-2xl px-4 py-3 shadow ${
                mine ? "bg-[#7d9a75] text-white" : "bg-white text-[#2b3136]"
              }`}
            >
              <div className="whitespace-pre-wrap break-words">{m.text}</div>
              <div className={`text-xs mt-2 ${mine ? "text-white/80" : "text-gray-500"}`}>
                {formatDate(m.created_at)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function formatDate(iso) {
  try { return new Date(iso).toLocaleString(); } catch { return String(iso || ""); }
}
