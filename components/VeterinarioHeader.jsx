"use client";
import { FaPaw, FaBell, FaComments } from "react-icons/fa";
import Link from "next/link";
import BotonCerrarSesion from "@/components/BotonCerrarSesión";
import { useEffect, useState } from "react";
import UserChat from "@/components/UserChat"; // ajusta la ruta si lo guardaste en otro lado

// Fija tu WS local o usa env var en prod
const BASE_WS = process.env.NEXT_PUBLIC_WS_BASE || "ws://localhost:8001";

export default function VeterinarioHeader() {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [token, setToken] = useState(null);
  const [openChat, setOpenChat] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const u = JSON.parse(raw);
        const id = u?.id ?? u?.user?.id ?? u?.data?.id ?? null;
        if (id != null) setCurrentUserId(Number(id));
      }
    } catch {}
    const t = localStorage.getItem("token");
    if (t) setToken(t);
  }, []); // 👈 importante el arreglo de dependencias

  return (
    <>
      <header className="w-full bg-white shadow-md p-4 flex">
        <div className="flex justify-center">
          <Link href="/veterinario" className="flex items-center gap-3 text-[#e0795e]">
            <FaPaw size={28} />
            <h1 className="text-5xl font-bold text-[#e0795e] font-['Dancing_Script']">PetMatch</h1>
          </Link>
        </div>

        <div className='font-["Poppins"] ml-auto flex items-center gap-4'>
          <FaBell
            size={24}
            className="text-[#7d8181] hover:text-[#D3764C] cursor-pointer"
            title="Notificaciones"
          />

          {/* Botón para abrir chat */}
          <button
            type="button"
            onClick={() => setOpenChat(true)}
            className="text-[#7d8181] hover:text-[#D3764C] transition-colors"
            title="Mensajes"
            aria-label="Abrir mensajes"
            disabled={!token}
          >
            <FaComments size={24} />
          </button>

          <Link href="/veterinario" className="text-[#7d8181] hover:text-[#D3764C]">
            Inicio
          </Link>
          <Link href="/mascotas/nueva" className="ml-4 text-[#7d8181] hover:text-[#D3764C]">
            Nueva Mascota
          </Link>
          <Link href="/mascotas/mis-solicitudes" className="ml-4 text-[#7d8181] hover:text-[#D3764C]">
            Ver solicitudes
          </Link>
          <Link href="/mi-perfil" className="ml-4 text-[#7d8181] hover:text-[#D3764C]">
            Mi Perfil
          </Link>

          <BotonCerrarSesion className="ml-4 text-[#7d8181] hover:text-[#D3764C]" />
        </div>
      </header>

      {/* Panel flotante del chat */}
      {openChat && (
        <div className="fixed inset-0 z-[9998]">
          {/* fondo semi-transparente para cerrar al hacer click */}
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setOpenChat(false)}
          />
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
                  currentUserId={currentUserId ?? -1} // si aún no tienes el id, igual funciona
                  token={token}
                  baseWs={BASE_WS}
                  // sin initialPeer → abre la bandeja para elegir conversación
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
    </>
  );
}
