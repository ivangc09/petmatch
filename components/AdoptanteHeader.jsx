"use client";

import { FaPaw, FaComments, FaBars, FaTimes } from "react-icons/fa";
import Link from "next/link";
import { useEffect, useState } from "react";
import BotonCerrarSesion from "@/components/BotonCerrarSesión";
import Notification from "./Notificacion";

export default function AdoptanteHeader() {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [token, setToken] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        // usuario
        const raw = localStorage.getItem("user");
        if (raw) {
          const u = JSON.parse(raw);
          const id = u?.id ?? u?.user?.id ?? u?.data?.id ?? null;
          if (id != null) setCurrentUserId(id);
        }

        // token: busca en varias llaves y soporta JSON
        const keys = ["token", "access", "authTokens", "userToken"];
        let found = null;
        for (const k of keys) {
          const v = localStorage.getItem(k);
          if (!v) continue;
          try {
            const parsed = JSON.parse(v);
            found =
              parsed?.access ||
              parsed?.token ||
              parsed?.access_token ||
              parsed?.key ||
              v;
          } catch {
            found = v;
          }
          if (found) break;
        }
        if (found) setToken(found);
      }
    } catch (e) {
      console.error("No pude leer user/token desde localStorage:", e);
    }
  }, []);

  const LinkItem = ({ href, children, className = "" }) => (
    <Link
      href={href}
      className={`block px-3 py-2 rounded-lg text-[#7d8181] hover:text-[#D3764C] hover:bg-black/5 md:hover:bg-transparent ${className}`}
    >
      {children}
    </Link>
  );

  return (
    <header className="w-full bg-white/95 backdrop-blur shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top bar */}
        <div className="flex h-16 md:h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/adoptante" className="flex items-center gap-3 text-[#e0795e]">
            <FaPaw className="shrink-0" size={24} />
            <h1 className="font-bold text-[#e0795e] font-['Dancing_Script'] text-2xl sm:text-3xl md:text-4xl">
              PetMatch
            </h1>
          </Link>

          {/* Right side (icons + desktop nav) */}
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-4 font-['Poppins']">
              {/* Notificaciones */}
              <Notification token={token} />

              {/* Ícono de mensajes: SIEMPRE navega */}
              <Link
                href="/adoptante/chat"
                className="relative z-10 text-[#7d8181] hover:text-[#D3764C] transition-colors"
                aria-label="Abrir chat"
                title="Abrir chat"
              >
                <FaComments size={22} />
              </Link>

              <LinkItem href="/adoptante">Inicio</LinkItem>
              <LinkItem href="/adoptante#mascotas-list">Encontrar mascotas</LinkItem>
              <LinkItem href="/mascotas/mascota-perfecta">Mascota Perfecta</LinkItem>
              <LinkItem href="/mi-perfil">Mi Perfil</LinkItem>
              <div className="px-3">
                <BotonCerrarSesion className="text-[#7d8181] hover:text-[#D3764C]" />
              </div>
            </div>

            {/* Mobile: notifications + chat + hamburger */}
            <div className="md:hidden flex items-center gap-3">
              <Notification token={token} />

              {/* Ícono de mensajes en móvil: SIEMPRE navega */}
              <Link
                href="/adoptante/chat"
                className="relative z-10 text-[#7d8181] hover:text-[#D3764C] transition-colors"
                aria-label="Abrir chat"
                title="Abrir chat"
              >
                <FaComments size={20} />
              </Link>

              {/* Hamburger */}
              <button
                onClick={() => setOpen((v) => !v)}
                aria-label="Abrir menú"
                className="inline-flex items-center justify-center rounded-lg p-2 text-[#7d8181] hover:text-[#D3764C] hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-[#e0795e]"
              >
                {open ? <FaTimes size={18} /> : <FaBars size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <nav className="md:hidden font-['Poppins'] pb-4 animate-in fade-in slide-in-from-top-2">
            <div className="space-y-1 rounded-2xl border border-black/5 bg-white p-2 shadow-xl">
              <LinkItem href="/adoptante">Inicio</LinkItem>
              <LinkItem href="/adoptante#mascotas-list">Encontrar mascotas</LinkItem>
              <LinkItem href="/como-adoptar">¿Cómo adoptar?</LinkItem>
              <LinkItem href="/mi-perfil">Mi Perfil</LinkItem>
              <div className="px-2 pt-1">
                <BotonCerrarSesion className="w-full justify-start text-[#7d8181] hover:text-[#D3764C]" />
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
