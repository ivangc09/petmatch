"use client";

export default function FiltersBar({ search, setSearch, petId, setPetId, onApply, pageSize, setPageSize }) {
    return (
        <div className="mb-4 flex flex-wrap items-center gap-3">
            <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onApply()}
                placeholder="Buscar por nombre, email, teléfono…"
                className="w-full md:w-80 rounded-xl border px-3 py-2 text-sm"
            />
            <input
                value={petId}
                onChange={(e) => setPetId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onApply()}
                placeholder="Filtrar por ID de mascota"
                className="w-full md:w-56 rounded-xl border px-3 py-2 text-sm"
            />
            <div className="flex items-center gap-2">
                <label className="text-sm text-[#6b7076]">Por página</label>
                <select
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    className="border rounded-xl px-2 py-1 text-sm"
                >
                    {[5, 10, 20, 50].map((n) => (
                        <option key={n} value={n}>{n}</option>
                    ))}
                </select>
            </div>

            <button
                onClick={onApply}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50"
            >
                Aplicar
            </button>
        </div>
    );
}
