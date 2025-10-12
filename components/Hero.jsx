"use client";
import { useEffect, useState } from "react";

export default function Hero({
  onSearch = () => {},
  titulo = "",
  subtitulo = "",
  texto = "",
  tipoUsuario = "",
}) {
  const [term, setTerm] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    especie: "",
    tamaño: "",
    sexo: "",
    estado: "",
  });

  // Debounce: emite filtros + search al padre
  useEffect(() => {
    const id = setTimeout(() => {
      const payload = {
        ...filters,
        tamano: filters.tamaño, 
        search: term.trim() || "",
      };
      onSearch(payload);
    }, 400);
    return () => clearTimeout(id);
  }, [term, filters, onSearch]);

  const onSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...filters,
      tamano: filters.tamaño,
      search: term.trim() || "",
    };
    onSearch(payload);
  };

  const onReset = () => {
    const blank = { especie: "", tamaño: "", sexo: "", estado: "" };
    setTerm("");
    setFilters(blank);
    onSearch({ ...blank, tamano: "", search: "" });
  };

  return (
    <section className="relative flex flex-col items-center text-center px-4 py-12 bg-gradient-to-b from-[#fff8f4] to-[#fef4f0]">
      {/* Fondo decorativo, igual que el tuyo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-full bg-[#f8e8e1] opacity-50 pointer-events-none" />

      <div className="relative z-10 w-full max-w-5xl">
        <h1 className="text-5xl font-bold text-gray-800 font-[Inter]">
          {titulo}{" "}
          <span className="block text-[#D3764C] font-[Dancing_Script] text-6xl">
            {subtitulo}
          </span>
        </h1>

        <p className="mt-4 text-gray-600 max-w-2xl mx-auto">{texto}</p>

        {/* Barra de búsqueda + acciones (igual que tu estructura) */}
        <form
          onSubmit={onSubmit}
          className="mt-8 mx-auto bg-white shadow-lg rounded-xl p-4 w-full max-w-3xl
                    flex flex-col md:flex-row items-center justify-center gap-3"
        >
          {/* input: misma altura que los botones */}
          <input
            type="text"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Busca por nombre, raza, etc."
            aria-label="Buscar mascotas por nombre o raza"
            autoComplete="off"
            className="w-full md:flex-1 h-12 px-4 rounded-md border border-gray-300
                       focus:ring-2 focus:ring-[#D3764C] outline-none"
          />

          {/* botones: misma altura, no se estiran y se alinean */}
          <div className="grid grid-cols-2 md:flex gap-2 w-full md:w-auto">
            <button
              type="button"
              onClick={() => setFiltersOpen((v) => !v)}
              className="h-12 px-4 w-full md:w-auto shrink-0 rounded-md
                         bg-[#7d9a75] text-white hover:bg-[#607859]
                         transition-colors inline-flex items-center justify-center"
              aria-expanded={filtersOpen}
              aria-controls="filtros-panel"
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M3 5h18v2H3V5zm4 6h10v2H7v-2zm-2 6h14v2H5v-2z"/></svg>
              Filtros
            </button>

            <button
              type="button"
              onClick={onReset}
              className="h-12 px-4 w-full md:w-auto shrink-0 rounded-md
                         bg-[#D3764C] text-white hover:bg-[#e0795e]
                         transition-colors inline-flex items-center justify-center"
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 6V3L8 7l4 4V8a4 4 0 1 1-4 4H6a6 6 0 1 0 6-6z"/></svg>
              Reiniciar
            </button>

          </div>
        </form>

        {/* Panel de filtros (idéntico en layout y clases) */}
        {filtersOpen && (
          <div
            id="filtros-panel"
            className={`mt-3 bg-white shadow rounded-xl p-4 grid text-left ${
              tipoUsuario === "veterinario"
                ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-4"
                : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
            } gap-3`}
          >
            {/* Especie */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Especie</label>
              <select
                value={filters.especie}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, especie: e.target.value }))
                }
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="">Todas</option>
                <option value="perro">Perro</option>
                <option value="gato">Gato</option>
              </select>
            </div>

            {/* Tamaño (estado interno con ñ) */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Tamaño</label>
              <select
                value={filters.tamaño}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, tamaño: e.target.value }))
                }
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="">Todos</option>
                <option value="pequeño">Pequeño</option>
                <option value="mediano">Mediano</option>
                <option value="grande">Grande</option>
              </select>
            </div>

            {/* Sexo */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Sexo</label>
              <select
                value={filters.sexo}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, sexo: e.target.value }))
                }
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="">Todos</option>
                <option value="macho">Macho</option>
                <option value="hembra">Hembra</option>
              </select>
            </div>

            {/* Estado */}
            {tipoUsuario === "veterinario" && (
              <div>
                <label className="block text-sm text-gray-600 mb-1">Estado</label>
                <select
                  value={filters.estado}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, estado: e.target.value }))
                  }
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="">Todos</option>
                  <option value="disponible">Disponible</option>
                  <option value="adoptado">Adoptado</option>
                </select>
              </div>
            )}
          </div>
        )}

        <div className="mt-3 h-6" />
      </div>
    </section>
  );
}
