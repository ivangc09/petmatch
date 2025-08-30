"use client";

import { FaPaw, FaBell, FaComments } from "react-icons/fa";
import Link from "next/link";
import { useEffect, useState } from "react";
import BotonCerrarSesion from "@/components/BotonCerrarSesión";
import UserChat from "@/components/UserChat";

export default function AdoptanteHeader({ otherUserId = 2, chatTitle = "Chat con Juan" }) {
  const [showChat, setShowChat] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const raw = localStorage.getItem("user");
      if (!raw) return;
      const u = JSON.parse(raw);
      const id = u?.id ?? u?.user?.id ?? u?.data?.id ?? null;
      if (id != null) setCurrentUserId(id);
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
        <FaBell size={24} className="text-[#7d8181] hover:text-[#D3764C] cursor-pointer" />

        {/* Botón de chat */}
        <FaComments
          size={24}
          className="text-[#7d8181] hover:text-[#D3764C] cursor-pointer"
          onClick={() => setShowChat((v) => !v)}
          title="Abrir chat"
        />

        <Link href="/adoptante" className="text-[#7d8181] hover:text-[#D3764C]">Inicio</Link>
        <Link href="" className="ml-4 text-[#7d8181] hover:text-[#D3764C]">Encontrar mascotas</Link>
        <Link href="" className="ml-4 text-[#7d8181] hover:text-[#D3764C]">¿Cómo adoptar?</Link>
        <Link href="/mi-perfil" className="ml-4 text-[#7d8181] hover:text-[#D3764C]">Mi Perfil</Link>

        <BotonCerrarSesion className="ml-4 text-[#7d8181] hover:text-[#D3764C]" />
      </div>

      {/* Chat flotante */}
      {showChat && (
        <div className="fixed top-16 right-4 z-50">
          {currentUserId ? (
            <UserChat
              otherUserId={otherUserId}       // ← ID del otro usuario (puedes pasarlo por props/estado)
              currentUserId={currentUserId}   // ← tu ID leído de localStorage
              title={chatTitle}
            />
          ) : (
            <div className="w-80 h-96 bg-white shadow-lg rounded-lg p-4 flex items-center justify-center">
              <p className="text-sm text-gray-600 text-center">
                Inicia sesión para usar el chat.
              </p>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
