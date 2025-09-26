"use client";
import { FaPaw, FaBell, FaComments } from "react-icons/fa";
import Link from "next/link";
import BotonCerrarSesion from "@/components/BotonCerrarSesión";
import { useEffect, useState } from "react";

export default function VeterinarioHeader() {
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
    const t = localStorage.getItem("token");
    if (t) setToken(t);
  }, []);

  return (
    <>
      <header className="w-full bg-white shadow-md p-4 flex">
        <div className="flex justify-center">
          <Link href="/veterinario" className="flex items-center gap-3 text-[#e0795e]">
            <FaPaw size={28} />
            <h1 className="text-5xl font-bold text-[#e0795e] font-['Dancing_Script']">
              PetMatch
            </h1>
          </Link>
        </div>

        <div className='font-["Poppins"] ml-auto flex items-center gap-4'>
          <FaBell
            size={24}
            className="text-[#7d8181] hover:text-[#D3764C] cursor-pointer"
            title="Notificaciones"
          />

          {/* Link a la página de chat (ya no modal flotante) */}
          <Link
            href={token ? "/adoptante/chat" : "#"}
            className={`text-[#7d8181] hover:text-[#D3764C] transition-colors ${
              token ? "" : "pointer-events-none opacity-60"
            }`}
            aria-label="Mensajes"
            title={token ? "Mensajes" : "Inicia sesión para ver tus mensajes"}
          >
            <FaComments size={24} />
          </Link>

          <Link href="/veterinario" className="text-[#7d8181] hover:text-[#D3764C]">
            Inicio
          </Link>
          <Link href="/mascotas/nueva" className="ml-4 text-[#7d8181] hover:text-[#D3764C]">
            Nueva Mascota
          </Link>
          <Link
            href="/mascotas/mis-solicitudes"
            className="ml-4 text-[#7d8181] hover:text-[#D3764C]"
          >
            Ver solicitudes
          </Link>
          <Link href="/mi-perfil" className="ml-4 text-[#7d8181] hover:text-[#D3764C]">
            Mi Perfil
          </Link>

          <BotonCerrarSesion className="ml-4 text-[#7d8181] hover:text-[#D3764C]" />
        </div>
      </header>
    </>
  );
}
