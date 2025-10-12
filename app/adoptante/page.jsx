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
  const [items, setItems] = useState([]);       // antes "mascotas"
  const [total, setTotal] = useState(0);        // nuevo: count del backend
  const [page, setPage] = useState(1);          // nuevo: página actual
  const pageSize = 6;                           // fijo, igual que en DRF

  const [tipoUsuario, setTipoUsuario] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

  useEffect(() => {
    const t = localStorage.getItem("token");
    const tipo = localStorage.getItem("tipo_usuario");
    if (!t || tipo !== "adoptante") {
      router.push("/login");
      return;
    }
    setTipoUsuario(tipo);
    setToken(t);
    fetchPage(1, t);
  }, [router]);

  async function fetchPage(p, t = token) {
    try {
      const res = await fetch(`${API_BASE}/api/mascotas/ver-mascotas/?page=${p}`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setItems(data.results || []);
      setTotal(data.count || 0);
      setPage(p);
    } catch (e) {
      setError("Error al obtener mascotas");
    }
  }

  if (error) router.push("/login");

  const totalPages = Math.ceil(total / pageSize);

  return (
    <main>
      <AdoptanteHeader />

      {/* Si tu Hero hace búsquedas, haz que resetee a página 1 */}
      <Hero
        apiBase={API_BASE}
        endpointPath="/api/mascotas/ver-mascotas/"
        token={token}
        onResults={() => fetchPage(1)}  // fuerza recarga desde p=1
        titulo="Encuentra a tu Perfecta"
        subtitulo="Compañia"
        texto="Descubre mascotas increíbles que esperan su hogar para siempre. Cada perfil cuenta una historia única de resiliencia, amor y esperanza para un nuevo comienzo."
      />

      <SeccionMedia cantidadMascotas={total} texto={"listas para adoptar"} />

      <div className="flex gap-4 justify-center flex-wrap bg-[#f6f5f3] pb-6">
        {items.map((mascota) => (
          <div key={mascota.id} className="p-6 mb-4 max-w-md">
            <PetCard mascota={mascota} tipoUsuario={tipoUsuario} />
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 my-6">
          <button
            onClick={() => fetchPage(page - 1)}
            disabled={page === 1}
            className={`px-3 py-2 rounded-md font-medium ${
              page === 1
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-[#7d9a75] text-white hover:bg-[#607859]"
            }`}
          >
            ← Anterior
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => fetchPage(i + 1)}
              className={`px-3 py-2 rounded-md font-medium ${
                page === i + 1
                  ? "bg-[#7d9a75] text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => fetchPage(page + 1)}
            disabled={page === totalPages}
            className={`px-3 py-2 rounded-md font-medium ${
              page === totalPages
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-[#7d9a75] text-white hover:bg-[#607859]"
            }`}
          >
            Siguiente →
          </button>
        </div>
      )}

      <Chatbot />
    </main>
  );
}
