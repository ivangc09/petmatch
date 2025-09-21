"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import AdoptanteHeader from "@/components/AdoptanteHeader";
import Hero from "@/components/Hero";
import PetCard from "@/components/PetCard";
import SeccionMedia from "@/components/SeccionMedia";
import Chatbot from "@/components/Chatbot";

export default function AdoptanteDashboard() {
  const router = useRouter();
  const [mascotas, setMascotas] = useState([]);
  const [tipoUsuario, setTipoUsuario] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

  // Carga inicial + guardia de ruta
  useEffect(() => {
    const t = localStorage.getItem("token");
    const tipo = localStorage.getItem("tipo_usuario");

    if (!t || tipo !== "adoptante") {
      router.push("/login");
      return;
    }

    setTipoUsuario(tipo);
    setToken(t);

    // Carga inicial (sin filtros)
    fetch(`${API_BASE}/api/mascotas/ver-mascotas/`, {
      headers: { Authorization: `Bearer ${t}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.json();
      })
      .then((data) => setMascotas(Array.isArray(data) ? data : (data.results ?? [])))
      .catch(() => setError("Error al obtener mascotas"));
  }, [router]);

  if (error) router.push("/login");

  return (
    <main>
      <AdoptanteHeader />

      {/* El Hero ahora controla la búsqueda y manda resultados acá vía onResults */}
      <Hero
        apiBase={API_BASE}
        endpointPath="/api/mascotas/ver-mascotas/"
        token={token}
        onResults={(items) => setMascotas(items)}
        titulo="Encuentra a tu Perfecta"
        subtitulo="Compañia"
        texto="Descubre mascotas increíbles que esperan su hogar para siempre. Cada perfil cuenta una historia única de resiliencia, amor y esperanza para un nuevo comienzo."
      />

      <SeccionMedia cantidadMascotas={mascotas.length} texto={"listas para adoptar"} />

      <div className="flex gap-4 justify-center flex-wrap bg-[#f6f5f3]">
        {mascotas.map((mascota) => (
          <div key={mascota.id} className="p-6 mb-4 max-w-md">
            <PetCard mascota={mascota} tipoUsuario={tipoUsuario} />
          </div>
        ))}
      </div>

      <Chatbot />
    </main>
  );
}
