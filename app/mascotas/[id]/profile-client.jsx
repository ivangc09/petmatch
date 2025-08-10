"use client";
import { useState } from "react";
import Link from "next/link";
import AdoptanteHeader from "@/components/AdoptanteHeader";
import Comentarios from "@/components/Comentarios";
import Chatbot from "@/components/Chatbot";

export default function PetProfile({ mascota }) {
  const {
    id,
    nombre,
    fotos,
    edad,
    sexo,
    raza,
    tamaño,
    descripcion,
  } = mascota;

  const [active, setActive] = useState(0);
  const mainImg = fotos[active] ?? mascota.fotos ?? "/placeholder-pet.jpg";

  return (
    <div>
        <AdoptanteHeader/>
        <div className="min-h-screen bg-gradient-to-b from-[#fff6f1] to-[#fdeee7]">
            <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Encabezado */}
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#2b3136]">{nombre}</h1>
            <p className="text-[#6b7076] mt-2">
              {raza || "-"} • {sexo || "-"} • {tamaño || "-"}
            </p>
          </div>
          <Link
            href="/adoptante"
            className="rounded-xl px-4 py-2 bg-[#fceae0] text-[#9f5b53] hover:bg-[#f8dfd2] transition-colors"
          >
            ← Volver
          </Link>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Columna principal */}
          <section className="lg:col-span-2">
            {/* Galería */}
            <div className="rounded-2xl overflow-hidden shadow-lg bg-white">
              <img
                src={fotos}
                alt={`Foto de ${nombre}`}
                className="w-full h-[360px] md:h-[440px] object-center"
              />
              {Array.isArray(fotos) && fotos.length > 1 && (
                <div className="flex gap-3 p-4 overflow-x-auto">
                  {fotos.map((src, i) => (
                    <button
                      key={i}
                      onClick={() => setActive(i)}
                      className={`h-20 w-28 flex-shrink-0 rounded-xl overflow-hidden border transition
                        ${active === i ? "border-[#e0795e] ring-2 ring-[#f6b19f]" : "border-gray-200"}`}
                      aria-label={`Miniatura ${i + 1}`}
                    >
                      <img src={src} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Chips rápidos (solo campos no comentados) */}
            <div className="flex flex-wrap gap-2 mt-6">
              <Chip>{edad ? `${edad} años` : "Edad -"}</Chip>
              <Chip>{sexo || "Sexo -"}</Chip>
              <Chip>{tamaño || "Tamaño -"}</Chip>
              <Chip>{raza || "Raza -"}</Chip>
            </div>

            {/* Descripción */}
            <div className="mt-6 rounded-2xl bg-white shadow p-6">
              <h2 className="text-2xl font-bold text-[#2b3136]">Sobre {nombre}</h2>
              <p className="mt-3 text-[#61666b] leading-relaxed">
                {descripcion || "Sin descripción disponible por el momento."}
              </p>
            </div>

            {/* Comentarios */}
            <Comentarios mascotaId={id} />
          </section>

          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-6 lg:sticky lg:top-6 h-max">
            {/* Acciones */}
            <div className="rounded-2xl bg-white shadow p-6">
              <h3 className="text-xl font-bold text-[#2b3136]">¿Te interesa?</h3>
              <p className="text-[#61666b] mt-2">¡Dale la oportunidad de un nuevo hogar!</p>
              <div className="mt-4 flex flex-col gap-3">
                <Link
                  href={`/adopcion/solicitud?petId=${encodeURIComponent(id)}`}
                  className="inline-flex items-center justify-center rounded-xl px-5 py-3 bg-[#7d9a75] text-white hover:bg-[#607859] transition-colors"
                >
                  Solicitar adopción
                </Link>
                <Link
                  href={`/chat?petId=${encodeURIComponent(id)}`}
                  className="inline-flex items-center justify-center rounded-xl px-5 py-3 bg-[#e0795e] text-white hover:bg-[#D3764C] transition-colors"
                >
                  Enviar mensaje
                </Link>
              </div>
            </div>
          </aside>
        </div>
        <Chatbot />
      </div>
    </div>
    </div>
  );
}

function Chip({ children }) {
  return (
    <span className="px-3 py-1 rounded-full bg-[#7d9a75] text-[#f3f4f6] text-sm">
      {children}
    </span>
  );
}