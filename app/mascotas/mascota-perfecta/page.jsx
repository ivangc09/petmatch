"use client";

import { useState } from "react";
import Link from "next/link";
import AdoptanteHeader from "@/components/AdoptanteHeader";
import MiniPetCard from "@/components/MiniPetCard";

export default function EncuestaPage() {
  const [formData, setFormData] = useState({
    personalidad: "",
    convive: "",
    tamanio: "",
    edad: "",
  });

  const [recomendadas, setRecomendadas] = useState([]);
  const [explicacionAI, setExplicacionAI] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [errorAI, setErrorAI] = useState(null);
  const [mostrandoResultados, setMostrandoResultados] = useState(false);

  // Usa los nombres de env definitivos y defaults correctos
  const API_BASE = "https://petmatchbackend-production.up.railway.app";
  const AI_BASE  = "https://recomendadorgpt-production.up.railway.app";

  const toAICompatPreferencias = (fd) => {
    const esJugueton = fd.personalidad === "juguetón" ? true : (fd.personalidad === "tranquilo" ? false : undefined);
    const esTranquilo = fd.personalidad === "tranquilo" ? true : (fd.personalidad === "juguetón" ? false : undefined);
    const conviveBool = fd.convive === "sí" ? true : (fd.convive === "no" ? false : undefined);

    // Enviar null en lugar de undefined para que JSON.stringify conserve las claves si deseas depurar
    return {
      tamanio: fd.tamanio || null,
      edad: fd.edad || null,
      es_jugueton: esJugueton ?? null,
      es_tranquilo: esTranquilo ?? null,
      convive_otras_mascotas: conviveBool ?? null,
    };
  };

  const toLeanMascota = (m) => ({
    id: m.id,
    nombre: m.nombre,
    tamanio: m.tamanio ?? m.size ?? null,
    edad: m.edad ?? m.age ?? null,
    personalidad: m.personalidad ?? m.personality ?? null,
    convive_con_otros: m.convive_con_otros ?? m.convive ?? m.good_with_pets ?? null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingAI(true);
    setErrorAI(null);
    setMostrandoResultados(false);

    try {
      // 1) Traer catálogo desde tu backend (Django)
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

      const catRes = await fetch(`${API_BASE}/api/mascotas/ver-mascotas/`, {
        method: "GET",
        mode: "cors",
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (!catRes.ok) throw new Error(`Catálogo HTTP ${catRes.status}`);
      const catalogo = await catRes.json();

      // Soporta arreglo directo o formato paginado { results: [...] }
      const lista = Array.isArray(catalogo)
        ? catalogo
        : Array.isArray(catalogo?.results)
          ? catalogo.results
          : [];
      const mascotasLean = lista.map(toLeanMascota);

      // 2) Enviar preferencias + catálogo a FastAPI (IA)
      const payload = {
        preferencias: toAICompatPreferencias(formData),
        mascotas: mascotasLean,
      };
      console.log("PAYLOAD IA =>", payload);

      const iaRes = await fetch(`${AI_BASE}/recomendar`, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!iaRes.ok) {
        const txt = await iaRes.text().catch(() => "");
        throw new Error(`IA HTTP ${iaRes.status}${txt ? `: ${txt}` : ""}`);
      }
      const data = await iaRes.json();

      setExplicacionAI(data.explicacion || "");
      setRecomendadas(Array.isArray(data.recomendadas) ? data.recomendadas : []);
      setMostrandoResultados(true);
    } catch (err) {
      setErrorAI(err.message || "Error al recomendar mascota");
      setMostrandoResultados(true);
    } finally {
      setLoadingAI(false);
    }
  };

  const handleReiniciar = () => {
    setFormData({ personalidad: "", convive: "", tamanio: "", edad: "" });
    setRecomendadas([]);
    setExplicacionAI("");
    setErrorAI(null);
    setMostrandoResultados(false);
  };

  return (
    <>
      <AdoptanteHeader />
      <div className="min-h-screen bg-gradient-to-br from-[#fff6f1] to-[#fdeee7] py-10 px-4">
        <div className="mx-auto max-w-6xl px-4">
          <header className="mb-6">
            <nav className="text-sm text-[#6b7076]">
              <Link href="/adoptante" className="hover:underline">Panel</Link>
              <span className="mx-2">/</span>
              <span className="mx-2 font-medium">Mascota Perfecta</span>
            </nav>
          </header>
        </div>

        <div className="max-w-2xl mx-auto bg-white shadow-2xl rounded-3xl p-8">
          {!mostrandoResultados ? (
            <>
              <h2 className="text-3xl font-bold mb-6 text-center">Encuentra la mascota perfecta</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block mb-2 font-medium text-gray-700">Personalidad:</label>
                  <select
                    name="personalidad"
                    value={formData.personalidad}
                    onChange={handleChange}
                    className="w-full rounded-xl border-gray-300 shadow-sm focus:ring-[#7d9a75] focus:border-[#7d9a75]"
                  >
                    <option value="">Cualquiera</option>
                    <option value="juguetón">Juguetón</option>
                    <option value="tranquilo">Tranquilo</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2 font-medium text-gray-700">Convive con otras mascotas:</label>
                  <select
                    name="convive"
                    value={formData.convive}
                    onChange={handleChange}
                    className="w-full rounded-xl border-gray-300 shadow-sm focus:ring-[#7d9a75] focus:border-[#7d9a75]"
                  >
                    <option value="">Cualquiera</option>
                    <option value="sí">Sí</option>
                    <option value="no">No</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2 font-medium text-gray-700">Tamaño:</label>
                  <select
                    name="tamanio"
                    value={formData.tamanio}
                    onChange={handleChange}
                    className="w-full rounded-xl border-gray-300 shadow-sm focus:ring-[#7d9a75] focus:border-[#7d9a75]"
                  >
                    <option value="">Cualquiera</option>
                    <option value="pequeño">Pequeño</option>
                    <option value="mediano">Mediano</option>
                    <option value="grande">Grande</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2 font-medium text-gray-700">Edad:</label>
                  <select
                    name="edad"
                    value={formData.edad}
                    onChange={handleChange}
                    className="w-full rounded-xl border-gray-300 shadow-sm focus:ring-[#7d9a75] focus:border-[#7d9a75]"
                  >
                    <option value="">Cualquiera</option>
                    <option value="cachorro">Cachorro</option>
                    <option value="adulto">Adulto</option>
                    <option value="senior">Senior</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#e0795e] text-white py-3 rounded-xl shadow hover:bg-[#D3764C] transition text-lg font-semibold"
                >
                  {loadingAI ? "Buscando..." : "Enviar Encuesta"}
                </button>
              </form>
            </>
          ) : (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-center text-[#7d9a75]">Resultados de la recomendación</h2>

              {errorAI ? (
                <p className="text-center text-red-600">{errorAI}</p>
              ) : (
                <>
                  {explicacionAI && (
                    <div className="mb-6 p-4 rounded-xl bg-[#fff6f1] text-[#6b7076] text-sm whitespace-pre-wrap">
                      {explicacionAI}
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {recomendadas.map((m, idx) => (
                      <div key={m.id || idx}>
                        <MiniPetCard idMascota={m.id} />
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div className="flex justify-center mt-8">
                <button onClick={handleReiniciar} className="px-6 py-2 rounded-xl bg-gray-400 text-white hover:bg-gray-500 transition">
                  Volver a la encuesta
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
