"use client";

import { FaPaw, FaComments } from "react-icons/fa";
import Link from "next/link";
import { useEffect, useState } from "react";
import BotonCerrarSesion from "@/components/BotonCerrarSesión";
import Notification from "./Notificacion";

export default function AdoptanteHeader() {
  const [currentUserId, setCurrentUserId] = useState(null);
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
          <h1 className="text-5xl font-bold text-[#e0795e] font-['Dancing_Script']">
            PetMatch
          </h1>
        </Link>
      </div>

      {/* Menú */}
      <div className='font-["Poppins"] ml-auto flex items-center gap-4'>
        <Notification token={token} />

        {/* Link a la página de chat (ya no modal flotante) */}
        <Link
          href={token ? "/adoptante/chat" : "#"}
          className={`text-[#7d8181] hover:text-[#D3764C] transition-colors ${
            token ? "" : "pointer-events-none opacity-60"
          }`}
          aria-label="Abrir chat"
          title={token ? "Abrir chat" : "Inicia sesión para chatear"}
        >
          <FaComments size={24} />
        </Link>

        <Link href="/adoptante" className="text-[#7d8181] hover:text-[#D3764C]">
          Inicio
        </Link>
        <Link
          href="/adoptante#mascotas-list"
          className="ml-4 text-[#7d8181] hover:text-[#D3764C]"
        >
          Encontrar mascotas
        </Link>
        <Link href="" className="ml-4 text-[#7d8181] hover:text-[#D3764C]">
          ¿Cómo adoptar?
        </Link>
        <Link href="/mi-perfil" className="ml-4 text-[#7d8181] hover:text-[#D3764C]">
          Mi Perfil
        </Link>
        <BotonCerrarSesion className="ml-4 text-[#7d8181] hover:text-[#D3764C]" />
      </div>
    </header>
  );
}
