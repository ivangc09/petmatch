"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { FaFilter } from "react-icons/fa";
import { BiReset } from "react-icons/bi";


export default function Hero({
  apiBase = "http://localhost:8000",
  endpointPath = "",
  token = "",
  onResults = () => {},
  titulo ="",
  subtitulo ="",
  texto = "",
}) {
  const [term, setTerm] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    especie: "",
    tamaño: "",
    sexo: "",
    estado: "",
  });

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const abortRef = useRef(null);

  const buildUrl = useMemo(() => {
    return (searchTerm, activeFilters) => {
      const params = new URLSearchParams();
      if (searchTerm?.trim()) params.set("search", searchTerm.trim());
      Object.entries(activeFilters).forEach(([k, v]) => {
        if (v) params.set(k, v);
      });
      const qs = params.toString();
      return `${apiBase}${endpointPath}${qs ? `?${qs}` : ""}`;
    };
  }, [apiBase, endpointPath]);

  const fetchPets = async (searchTerm, activeFilters) => {
    if (!token) return; // evita 404s hasta que haya token
    setLoading(true);
    setErr(null);

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const url = buildUrl(searchTerm, activeFilters);
      const res = await fetch(url, {
        method: "GET",
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      const items = Array.isArray(data) ? data : (data.results ?? []);
      onResults(items);
    } catch (e) {
      if (e.name !== "AbortError") setErr(e.message || "Error al cargar mascotas");
    } finally {
      setLoading(false);
    }
  };

  // Debounce al escribir (400ms). Quita esto si prefieres solo con "Buscar".
  useEffect(() => {
    if (!token) return;
    const id = setTimeout(() => {
      fetchPets(term, filters);
    }, 400);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term, filters, token]);

  const onSubmit = (e) => {
    e.preventDefault();
    fetchPets(term, filters);
  };

  const onReset = () => {
    const blank = { especie: "", tamaño: "", sexo: "", estado: "" };
    setTerm("");
    setFilters(blank);
    fetchPets("", blank);
  };

  return (
    <section className="relative flex flex-col items-center text-center px-4 py-12 bg-gradient-to-b from-[#fff8f4] to-[#fef4f0]">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-full bg-[#f8e8e1] opacity-50 pointer-events-none" />
      <div className="relative z-10 w-full max-w-5xl">
        <h1 className="text-5xl font-bold text-gray-800 font-[Inter]">
          {titulo}{" "}
          <span className="block text-[#D3764C] font-[Dancing_Script] text-6xl">
            {subtitulo}
          </span>
        </h1>
        <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
          {texto}
        </p>

        <form onSubmit={onSubmit} className="mt-8 bg-white shadow-lg rounded-xl p-4 flex items-center gap-4">
          <input
            type="text"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Busca por nombre, raza, etc."
            className="flex-1 px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-[#D3764C] outline-none"
          />

          <button
            type="button"
            onClick={() => setFiltersOpen((v) => !v)}
            className="bg-[#7d9a75] text-white px-4 py-2 rounded-md hover:bg-[#607859] transition-colors flex items-center"
            aria-expanded={filtersOpen}
            aria-controls="filtros-panel"
          >
            <FaFilter className="mr-2" />
            Filtros
          </button>

          <button
            type="button"
            onClick={onReset}
            className="bg-[#D3764C] text-white px-4 py-2 rounded-md hover:bg-[#e0795e] transition-colors flex items-center"
          >
            <BiReset className="mr-2" />
            Reiniciar
          </button>

        </form>

        {filtersOpen && (
          <div
            id="filtros-panel"
            className="mt-3 bg-white shadow rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-left"
          >
            <div>
              <label className="block text-sm text-gray-600 mb-1">Especie</label>
              <select
                value={filters.especie}
                onChange={(e) => setFilters((f) => ({ ...f, especie: e.target.value }))}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="">Todas</option>
                <option value="perro">Perro</option>
                <option value="gato">Gato</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Tamaño</label>
              <select
                value={filters.tamaño}
                onChange={(e) => setFilters((f) => ({ ...f, tamaño: e.target.value }))}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="">Todos</option>
                <option value="pequeño">Pequeño</option>
                <option value="mediano">Mediano</option>
                <option value="grande">Grande</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Sexo</label>
              <select
                value={filters.sexo}
                onChange={(e) => setFilters((f) => ({ ...f, sexo: e.target.value }))}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="">Todos</option>
                <option value="macho">Macho</option>
                <option value="hembra">Hembra</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Estado</label>
              <select
                value={filters.estado}
                onChange={(e) => setFilters((f) => ({ ...f, estado: e.target.value }))}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="">Todos</option>
                <option value="disponible">Disponible</option>
                <option value="adoptado">Adoptado</option>
              </select>
            </div>
          </div>
        )}

        {/* Mensajes de estado */}
        <div className="mt-3 h-6">
          {loading && <p className="text-gray-500">Buscando mascotas…</p>}
          {err && <p className="text-red-600">Error: {err}</p>}
        </div>
      </div>
    </section>
  );
}
