"use client";
import { useEffect, useMemo, useRef } from "react";

export default function ListaMensajes({
  items,
  messages,
  currentUserId,
  loading = false,
}) {
  const data = useMemo(() => (Array.isArray(items) ? items : messages) ?? [], [items, messages]);
  const me = currentUserId != null ? Number(currentUserId) : null;

  const endRef = useRef(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [data?.length]);

  return (
    <div
      className="
        flex flex-col gap-3 p-4 overflow-y-auto h-full
        bg-transparent
      "
    >
      {loading && (
        <div className="mx-auto text-xs text-gray-500 animate-pulse">Cargando…</div>
      )}

      {data.map((m, idx) => {
        const sid =
          m?.sender_id != null ? Number(m.sender_id)
          : m?.sender?.id != null ? Number(m.sender.id)
          : null;

        const mine = (m?.mine === true) || (me !== null && sid === me);
        const key = m?.client_id ?? m?.id ?? idx;

        return (
          <div key={key} className={`w-full flex ${mine ? "justify-end" : "justify-start"}`}>
            <div
              className={`
                group max-w-[78%] rounded-2xl px-4 py-2 shadow-sm
                ${mine
                  ? "bg-gradient-to-b from-[#7d9a75] to-[#607859] text-white shadow-[0_6px_18px_rgba(125,154,117,.25)]"
                  : "bg-white/90 border border-[#f3d7cb]/70 text-gray-800 shadow-[0_6px_18px_rgba(0,0,0,.04)]"}
              `}
            >
              <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                {m?.text ?? ""}
              </div>
              <div
                className={`mt-1 text-[10px] ${
                  mine ? "text-white/80" : "text-gray-500"
                }`}
              >
                {formatTime(m?.created_at)}
              </div>
            </div>
          </div>
        );
      })}

      <div ref={endRef} />
    </div>
  );
}

function formatTime(ts) {
  if (!ts) return "";
  try {
    const d = typeof ts === "string" ? new Date(ts) : ts;
    if (Number.isNaN(d?.getTime?.())) return "";
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
  } catch {
    return "";
  }
}
