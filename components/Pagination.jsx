"use client";

export default function Pagination({ page, setPage, totalPages }) {
    return (
        <div className="flex items-center justify-between gap-3">
            <div className="text-sm text-[#6b7076]">Página {page} de {totalPages}</div>
            <div className="flex items-center gap-2">
                <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className={`px-3 py-1.5 rounded-xl border ${page <= 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"}`}
                >
                    Anterior
                </button>
                <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className={`px-3 py-1.5 rounded-xl border ${page >= totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"}`}
                >
                    Siguiente
                </button>
            </div>
        </div>
    );
}
