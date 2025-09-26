"use client";

import { useEffect, useState } from "react";
import UserChat from "@/components/UserChat"; // tu componente ya robusto que lee ?peer=

export default function ChatPage() {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const u = JSON.parse(raw);
        const id = u?.id ?? u?.user?.id ?? u?.data?.id ?? null;
        if (id != null) setCurrentUserId(Number(id));
      }
    } catch {}
    const t = localStorage.getItem("token") || localStorage.getItem("access_token");
    if (t) setToken(t);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff6f1] to-[#fdeee7] p-4">
      {token ? (
        // UserChat ya toma el peerId desde window.location.search (?peer=)
        <UserChat currentUserId={currentUserId ?? -1} token={token} />
      ) : (
        <div className="max-w-3xl mx-auto rounded-xl bg-white shadow p-6 text-gray-600">
          Inicia sesión para chatear.
        </div>
      )}
    </div>
  );
}