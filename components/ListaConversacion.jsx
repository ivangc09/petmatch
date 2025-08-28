"use client";
import { useEffect, useState } from "react";

export default function ListaConversacion({ token, activePeerId, onSelectPeer }) {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    let ignore = false;
    const controller = new AbortController();

    const run = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:8000/api/chat/conversations/", {
          headers: {Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        const data = await res.json();
        if (!ignore) setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!ignore) setItems([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    run();

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [token]);

  const filtered = items.filter((c) =>
    (c?.peer?.nombre || "").toLowerCase().includes(q.toLowerCase())
  );

  return (
    <aside className="w-full md:w-80 border-r bg-white">
      <div className="p-3 border-b">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar…"
          className="w-full rounded-xl border px-3 py-2 outline-none focus:ring"
        />
      </div>

      {loading ? (
        <div className="p-4 text-sm text-gray-500">Cargando…</div>
      ) : filtered.length === 0 ? (
        <div className="p-4 text-sm text-gray-500">Sin conversaciones</div>
      ) : (
        <ul className="divide-y">
          {filtered.map((c) => {
            const pid = c?.peer?.id;
            const active = pid === activePeerId;
            return (
              <li
                key={pid}
                className={`p-4 hover:bg-gray-50 cursor-pointer flex gap-3 items-center ${
                  active ? "bg-[#fff6f1]" : ""
                }`}
                onClick={() => onSelectPeer(c.peer)}
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-[#2b3136]">
                      {c?.peer?.nombre || `Usuario ${pid}`}
                    </p>
                    {c?.unread > 0 && (
                      <span className="text-xs rounded-full px-2 py-0.5 bg-[#7d9a75] text-white">
                        {c.unread}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-1">
                    {c?.last_message?.text || "—"}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
