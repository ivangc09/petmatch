"use client";

import { FaPaw, FaComments, FaBars, FaTimes } from "react-icons/fa";
import Link from "next/link";
import { useEffect, useState } from "react";
import BotonCerrarSesion from "@/components/BotonCerrarSesión";
import Notification from "./Notificacion";

export default function AdoptanteHeader() {
    const [token, setToken] = useState(null);
    const [open, setOpen] = useState(false);

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

    const LinkItem = ({ href, children, className = "" }) => (
        <Link href={href} className={`block px-3 py-2 rounded-lg text-[#7d8181] hover:text-[#D3764C] hover:bg-black/5 md:hover:bg-transparent ${className}`}>
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
                            <Notification token={token} />
                            <Link
                                href={token ? "/adoptante/chat" : "#"}
                                className={`text-[#7d8181] hover:text-[#D3764C] transition-colors ${token ? "" : "pointer-events-none opacity-60"}`}
                                aria-label="Abrir chat"
                                title={token ? "Abrir chat" : "Inicia sesión para chatear"}
                            >
                                <FaComments size={22} />
                            </Link>

                            <LinkItem href="/adoptante">Inicio</LinkItem>
                            <LinkItem href="/adoptante#mascotas-list">Encontrar mascotas</LinkItem>
                            <LinkItem href="/como-adoptar">¿Cómo adoptar?</LinkItem>
                            <LinkItem href="/mi-perfil">Mi Perfil</LinkItem>
                            <div className="px-3">
                                <BotonCerrarSesion className="text-[#7d8181] hover:text-[#D3764C]" />
                            </div>
                        </div>

                        {/* Mobile: notifications + chat */}
                        <div className="md:hidden flex items-center gap-3">
                            <Notification token={token} />
                            <Link
                                href={token ? "/adoptante/chat" : "#"}
                                className={`text-[#7d8181] hover:text-[#D3764C] transition-colors ${token ? "" : "pointer-events-none opacity-60"}`}
                                aria-label="Abrir chat"
                                title={token ? "Abrir chat" : "Inicia sesión para chatear"}
                            >
                                <FaComments size={20} />
                            </Link>

                            {/* Hamburger */}
                            <button
                                onClick={() => setOpen(v => !v)}
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
                            <LinkItem href="/adoptante" />
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
