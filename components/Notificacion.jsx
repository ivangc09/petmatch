"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FaBell } from "react-icons/fa";
import useNotificationsWS from "@/hooks/useNotificationsWS";

export default function Notification({ token }) {
    const [unread, setUnread] = useState(0);
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const dropdownRef = useRef(null);

    const cleanedToken = useMemo(() => (token ? String(token).split(" ").pop() : ""), [token]);

    useNotificationsWS({
        token: cleanedToken,
        onMessage: (data) => {
            const msg = typeof data === "string" ? { type: "raw", payload: data } : data;

            // Si coincide con lo esperado:
            if (msg?.type === "adoption.accepted" || msg?.type === "adoption.rejected") {
                setMessages((prev) => [msg.payload, ...prev]);
                setUnread((n) => (open ? n : n + 1));
                return;
            }

            setMessages((prev) => [msg.payload ?? msg, ...prev]);
            setUnread((n) => (open ? n : n + 1));
        },
    });

    // cerrar al click fuera
    useEffect(() => {
        if (!open) return;
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
        };

        const onKey = (e) => e.key === "Escape" && setOpen(false);
        document.addEventListener("mousedown", handleClickOutside);
        window.addEventListener("keydown", onKey);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("keydown", onKey);
        };
    }, [open]);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => { setOpen((v) => !v); setUnread(0); }}
                className="relative text-[#7d8181] hover:text-[#D3764C] transition-colors"
                aria-label="Notificaciones"
                title="Notificaciones"
                disabled={!cleanedToken}
            >
                <FaBell size={24} />
                {unread > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] leading-none font-bold rounded-full px-1.5 py-1">
                        {unread > 99 ? "99+" : unread}
                    </span>
                )}
            </button>
            
            {open && (
                <div className="absolute right-0 mt-3 w-80 rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden z-50">
                    <div className="max-h-72 overflow-y-auto">
                        {messages.length === 0 ? (
                            <p className="p-4 text-sm text-gray-500">No tienes notificaciones</p>
                        ) : (
                            messages.map((msg, idx) => (
                                <div key={idx} className="p-3 border-b border-gray-100 text-sm hover:bg-gray-50">
                                    {/* muestra algo aunque el payload sea raro */}
                                    <p className="font-medium">{msg?.mascota_nombre ?? msg?.title ?? "Notificación"}</p>
                                    <p className="text-gray-600">
                                        {msg?.mensaje ?? (typeof msg === "string" ? msg : JSON.stringify(msg))}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>

                    {messages.length > 0 && (
                        <div className="flex justify-end gap-2 p-2">
                            <button onClick={() => setMessages([])} className="text-xs px-2 py-1 rounded border hover:bg-gray-50">
                                Borrar todo
                            </button>
                        </div>
                    )}
                </div>
            )}  
        </div>
    );
}
