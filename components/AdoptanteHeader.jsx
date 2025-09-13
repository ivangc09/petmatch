"use client";

import { FaPaw, FaComments } from "react-icons/fa";
import Link from "next/link";
import { useEffect, useState } from "react";
import BotonCerrarSesion from "@/components/BotonCerrarSesión";
import UserChat from "@/components/UserChat";
import Notification from "./Notificacion";

export default function AdoptanteHeader() {
  const BASE_WS = process.env.NEXT_PUBLIC_WS_BASE || "ws://localhost:8001";

  const [currentUserId, setCurrentUserId] = useState(null);
  const [openChat, setOpenChat] = useState(false);
  const [token, setToken] = useState(null);

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem("user");
        if (raw) {
          const u = JSON.parse(raw);
          const id = u?.id ?? u?.user?.id ?? u?.data?.id ?? null;
          if (id != null) setCurrentUserId(id);
        }
        const t = localStorage.getItem("token");
        if (t) setToken(t);
      }
    } catch (e) {
      console.error("No pude leer user desde localStorage:", e);
    }
  }, []);

  return (
    <header className="w-full bg-white shadow-md p-4 flex">
      {/* Logo */}
      <div className="flex justify-center">
        <Link href="/adoptante" className="flex items-center gap-3 text-[#e0795e]">
          <FaPaw size={28} />
          <h1 className="text-5xl font-bold text-[#e0795e] font-['Dancing_Script']">PetMatch</h1>
        </Link>
      </div>

      {/* Menú */}
      <div className='font-["Poppins"] ml-auto flex items-center gap-4'>
        <Notification token={token} />

        {/* Botón de chat (abre el panel correcto) */}
        <button
          type="button"
          onClick={() => setOpenChat(true)}
          className="text-[#7d8181] hover:text-[#D3764C] transition-colors"
          title="Abrir chat"
          aria-label="Abrir chat"
          disabled={!token}
        >
          <FaComments size={24} />
        </button>

        <Link href="/adoptante" className="text-[#7d8181] hover:text-[#D3764C]">Inicio</Link>
        <Link href="/adoptante#mascotas-list" className="ml-4 text-[#7d8181] hover:text-[#D3764C]">Encontrar mascotas</Link>
        <Link href="" className="ml-4 text-[#7d8181] hover:text-[#D3764C]">¿Cómo adoptar?</Link>
        <Link href="/mi-perfil" className="ml-4 text-[#7d8181] hover:text-[#D3764C]">Mi Perfil</Link>
        <BotonCerrarSesion className="ml-4 text-[#7d8181] hover:text-[#D3764C]" />
      </div>

      {/* Chat flotante */}
      {openChat && (
        <div className="fixed inset-0 z-[9998]">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpenChat(false)} />
          <div className="absolute top-16 right-4 z-[9999] w-[92vw] max-w-[980px]">
            <div className="relative bg-white rounded-xl shadow-xl">
              <button
                onClick={() => setOpenChat(false)}
                className="absolute -top-3 -right-3 bg-gray-700 text-white rounded-full w-8 h-8 shadow hover:bg-gray-600"
                title="Cerrar"
                aria-label="Cerrar chat"
              >
                ×
              </button>

              {token ? (
                <UserChat
                  currentUserId={currentUserId ?? -1}
                  token={token}
                  baseWs={BASE_WS}
                />
              ) : (
                <div className="w-[92vw] max-w-[980px] h-[520px] flex items-center justify-center text-sm text-gray-700 p-6">
                  Inicia sesión para ver tus mensajes.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
