"use client";
import { FaPaw, FaBell, FaComments } from "react-icons/fa";
import Link from "next/link";
import BotonCerrarSesion from "@/components/BotonCerrarSesión";
import { useEffect, useState } from "react";

export default function VeterinarioHeader() {
    const [token, setToken] = useState(null);
    const [open, setOpen] = useState(false);

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
                <Link href="/veterinario" className="flex items-center gap-3 text-[#e0795e]">
                    <FaPaw className="shrink-0" size={24} />
                    <h1 className="font-bold text-[#e0795e] font-['Dancing_Script'] text-2xl sm:text-3xl md:text-4xl">
                        PetMatch
                    </h1>
                </Link>

                {/* Right side */}
                <div className="flex items-center gap-2">
                    {/* Desktop nav */}
                    <div className="hidden md:flex items-center gap-4 font-['Poppins']">
                        <FaBell
                            size={22}
                            className="text-[#7d8181] hover:text-[#D3764C] cursor-pointer"
                            title="Notificaciones"
                        />
                        <Link
                            href={token ? "/adoptante/chat" : "#"}
                            className={`text-[#7d8181] hover:text-[#D3764C] transition-colors ${token ? "" : "pointer-events-none opacity-60"}`}
                            aria-label="Mensajes"
                            title={token ? "Mensajes" : "Inicia sesión para ver tus mensajes"}
                        >
                            <FaComments size={22} />
                        </Link>

                        <LinkItem href="/veterinario">Inicio</LinkItem>
                        <LinkItem href="/mascotas/nueva">Nueva Mascota</LinkItem>
                        <LinkItem href="/mascotas/mis-solicitudes">Ver solicitudes</LinkItem>
                        <LinkItem href="/mi-perfil">Mi Perfil</LinkItem>
                        <div className="px-3">
                            <BotonCerrarSesion className="text-[#7d8181] hover:text-[#D3764C]" />
                        </div>
                    </div>

                    <div className="md:hidden flex items-center gap-3">
                        <FaBell
                            size={20}
                            className="text-[#7d8181] hover:text-[#D3764C] cursor-pointer"
                            title="Notificaciones"
                        />
                        <Link
                            href={token ? "/adoptante/chat" : "#"}
                            className={`text-[#7d8181] hover:text-[#D3764C] transition-colors ${token ? "" : "pointer-events-none opacity-60"}`}
                            aria-label="Mensajes"
                            title={token ? "Mensajes" : "Inicia sesión para ver tus mensajes"}
                        >
                            <FaComments size={20} />
                        </Link>

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
                        <LinkItem href="/veterinario">Inicio</LinkItem>
                        <LinkItem href="/mascotas/nueva">Nueva Mascota</LinkItem>
                        <LinkItem href="/mascotas/mis-solicitudes">Ver solicitudes</LinkItem>
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
