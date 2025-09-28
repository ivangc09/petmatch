"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AdoptanteHeader from "@/components/AdoptanteHeader";
import Comentarios from "@/components/Comentarios";
import Chatbot from "@/components/Chatbot";
import UserChat from "@/components/UserChat";


export default function PetProfile({ mascota }) {
  const { id, nombre, fotos, edad, especie, sexo, raza, tamaño, descripcion, responsable } = mascota;

  const [active, setActive] = useState(0);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [token, setToken] = useState(null);
  const [showChat, setShowChat] = useState(false);

  const DOG_TARGET_HEIGHTS = {
  chico: 1.35,
  mediano: 1.58,
  grande: 1.75,
  };

  const especieNorm = (especie || "").toLowerCase();
  const tallaNorm = (tamaño || "").toLowerCase();


  const tallaClave =
    tallaNorm.includes("peque") || tallaNorm.includes("chico") ? "chico" :
    tallaNorm.includes("med") ? "mediano" :
    tallaNorm.includes("gigan") ? "gigante" :
    tallaNorm.includes("gran") ? "grande" :
    "mediano";


  const height_m = especieNorm === "gato" ? 1.28 : (DOG_TARGET_HEIGHTS[tallaClave] ?? 0.58);

  const markerCm = 10;

  const arHref = `/ar?type=${encodeURIComponent(especieNorm)}&name=${encodeURIComponent(nombre ?? "")}&marker=${markerCm}&height_m=${height_m.toFixed(2)}&ruler=1`;
  const arWorldHref = `/ar-world?type=${encodeURIComponent(especieNorm)}&name=${encodeURIComponent(nombre ?? "")}&height_m=${height_m.toFixed(2)}`;

  const mainImg = Array.isArray(fotos)
    ? (fotos[active] ?? "/placeholder-pet.jpg")
    : (fotos ?? "/placeholder-pet.jpg");

  // Lee tu ID (opcional) y el token para el chat
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

  const responsableId = responsable?.id ?? responsable ?? null;
  const soyElResponsable =
    currentUserId != null && responsableId != null && Number(currentUserId) === Number(responsableId);

  // Peer inicial para abrir chat directo con el responsable
  const initialPeer = useMemo(() => {
    if (!responsableId) return null;
    return {
      id: Number(responsableId),
      nombre: responsable?.nombre || responsable?.username || "Responsable",
      avatar: responsable?.avatar || responsable?.foto || null,
    };
  }, [responsableId, responsable]);

  const handleEnviarMensaje = () => {
    if (!responsableId) {
      alert("No se encontró el usuario responsable para abrir el chat.");
      return;
    }
    if (soyElResponsable) return;
    setShowChat(true);
  };

  return (
    <div>
      <AdoptanteHeader />
      <div className="min-h-screen bg-gradient-to-b from-[#fff6f1] to-[#fdeee7]">
        <div className="mx-auto max-w-6xl px-4 py-8">
          {/* Encabezado */}
          <header className="mb-6">
            <nav className="text-sm text-[#6b7076]">
                <Link href="/veterinario" className="hover:underline">Panel</Link>
                <span className="mx-2">/</span>
                <span className="mx-2 font-medium">{mascota.nombre}</span>
            </nav>
          </header>

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-[#2b3136]">{nombre}</h1>
              <p className="text-[#6b7076] mt-2 capitalize">
                {raza || "-"} • {sexo || "-"} • {tamaño || "-"}
              </p>
            </div>
            <Link href="/adoptante" className="rounded-xl px-4 py-2 bg-[#fceae0] text-[#9f5b53] hover:bg-[#f8dfd2]">
              ← Volver
            </Link>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Columna principal */}
            <section className="lg:col-span-2">
              {/* Galería */}
              <div className="rounded-2xl overflow-hidden shadow-lg bg-white">
                <img
                  src={mainImg}
                  alt={`Foto de ${nombre}`}
                  className="w-full h-[360px] md:h-[440px] object-center"
                />
                {Array.isArray(fotos) && fotos.length > 1 && (
                  <div className="flex gap-3 p-4 overflow-x-auto">
                    {fotos.map((src, i) => (
                      <button
                        key={i}
                        onClick={() => setActive(i)}
                        className={`h-20 w-28 flex-shrink-0 rounded-xl overflow-hidden border transition ${
                          active === i ? "border-[#e0795e] ring-2 ring-[#f6b19f]" : "border-gray-200"
                        }`}
                        aria-label={`Miniatura ${i + 1}`}
                      >
                        <img src={src} alt="" className="h-full w-full object-center" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Chips */}
              <div className="flex flex-wrap justify-between">
                <div className="flex flex-wrap gap-2 mt-6 items-center">
                  <Chip>{edad ? `${edad} años` : "Edad -"}</Chip>
                  <Chip>{sexo || "Sexo -"}</Chip>
                  <Chip>{tamaño || "Tamaño -"}</Chip>
                  <Chip>{raza || "Raza -"}</Chip>
                </div>

                <div className="mt-6">
                  <Link
                      href={arWorldHref}
                      target="_blank"
                      className="inline-flex items-center px-4 py-2 rounded-2xl bg-[#7d9a75] text-white hover:bg-[#607859]"
                  >
                      Ver en tu espacio (AR beta)
                  </Link>
                </div>
              </div>

              {/* Descripción */}
              <div className="mt-6 rounded-2xl bg-white shadow p-6">
                <h2 className="text-2xl font-bold text-[#2b3136]">Sobre {nombre}</h2>
                <p className="mt-3 text-[#61666b] leading-relaxed">
                  {descripcion || "Sin descripción disponible por el momento."}
                </p>
              </div>

              <Comentarios mascotaId={id} />
            </section>

            {/* Sidebar */}
            <aside className="lg:col-span-1 space-y-6 lg:sticky lg:top-6 h-max">
              <div className="rounded-2xl bg-white shadow p-6">
                <h3 className="text-xl font-bold text-[#2b3136]">¿Te interesa?</h3>
                <p className="text-[#61666b] mt-2">¡Dale la oportunidad de un nuevo hogar!</p>
                <div className="mt-4 flex flex-col gap-3">
                  <Link
                    href={`/mascotas/formulario-adopcion?petId=${encodeURIComponent(id)}`}
                    className="inline-flex items-center justify-center rounded-xl px-5 py-3 bg-[#7d9a75] text-white hover:bg-[#607859] transition-colors"
                  >
                    Solicitar adopción
                  </Link>

                  <Link
                    href={
                      soyElResponsable || !responsableId
                        ? "#"
                        : `/adoptante/chat?peer=${encodeURIComponent(responsableId)}`
                    }
                    className={`inline-flex items-center justify-center rounded-xl px-5 py-3 text-white transition-colors ${
                      soyElResponsable || !responsableId
                        ? "bg-gray-400 cursor-not-allowed pointer-events-none"
                        : "bg-[#e0795e] hover:bg-[#D3764C]"
                    }`}
                  >
                    Enviar mensaje
                  </Link>
                </div>
              </div>
            </aside>
          </div>

          {/* Chat flotante (reutilizable para adoptante o veterinaria) */}
          {showChat && (
            <div className="fixed top-16 right-4 z-[9999] w-[92vw] max-w-[980px]">
              <div className="relative">
                <button
                  onClick={() => setShowChat(false)}
                  className="absolute -top-3 -right-3 bg-gray-700 text-white rounded-full w-8 h-8 shadow hover:bg-gray-600"
                  title="Cerrar"
                >
                  ×
                </button> 

                {initialPeer && token ? (
                  <UserChat
                    currentUserId={currentUserId ?? -1} // si no hay id, igual funcionará; “mine” no se marcará
                    token={token}
                    initialPeer={initialPeer}
                  />
                ) : (
                  <div className="w-full max-w-[980px] h-[520px] bg-white shadow-lg rounded-xl p-4 flex items-center justify-center text-sm text-gray-600">
                    No se pudo preparar el chat (falta token o responsable).
                  </div>
                )}
              </div>
            </div>
          )}

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
