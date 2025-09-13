"use client";

function DocsCell({ idUrl, compUrl }) {
    const links = [];
    if (idUrl) links.push(<a key="id" className="underline text-[#2b3136]" href={idUrl} target="_blank" rel="noreferrer">ID</a>);
    if (compUrl) links.push(<a key="comp" className="underline text-[#2b3136]" href={compUrl} target="_blank" rel="noreferrer">Comprobante</a>);
    if (links.length === 0) return <span className="text-gray-400">—</span>;
    return <div className="space-x-2">{links}</div>;
}

export default function SolicitudesTable({ items, loading, error, formatDate, onOpenDetail }) {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
                <thead className="text-left">
                    <tr className="border-b">
                        <th className="py-2 px-2 text-[#6b7076] font-semibold">Fecha</th>
                        <th className="py-2 px-2 text-[#6b7076] font-semibold">Mascota</th>
                        <th className="py-2 px-2 text-[#6b7076] font-semibold">Solicitante</th>
                        <th className="py-2 px-2 text-[#6b7076] font-semibold">Contacto</th>
                        <th className="py-2 px-2 text-[#6b7076] font-semibold">Docs</th>
                        <th className="py-2 px-2"></th>
                    </tr>
                </thead>

                <tbody>
                    {loading ? (
                        <tr><td colSpan={6} className="py-6 text-center text-[#6b7076]">Cargando…</td></tr>
                    ) : error ? (
                        <tr><td colSpan={6} className="py-6 text-center text-red-600">{error}</td></tr>
                    ) : items.length === 0 ? (
                        <tr><td colSpan={6} className="py-6 text-center text-[#6b7076]">Sin solicitudes</td></tr>
                    ) : (
                        items.map((s) => (
                            <tr key={s.id} className="border-b">
                                <td className="py-2 px-2 whitespace-nowrap">{formatDate(s.fecha_solicitud)}</td>
                                <td className="py-2 px-2 font-medium">{s.mascota_nombre ?? s.mascota}</td>
                                <td className="py-2 px-2">
                                    <div className="font-medium">{s.nombre}</div>
                                    <div className="text-xs text-gray-500">
                                        {typeof s.adoptante === "object" ? s.adoptante?.username : null}
                                    </div>
                                </td>

                                <td className="py-2 px-2">
                                    <div>{s.telefono || "—"}</div>
                                    <div className="text-xs text-gray-500">{s.email || "—"}</div>
                                </td>

                                <td className="py-2 px-2">
                                    <DocsCell idUrl={s.id_oficial_url} compUrl={s.comprobante_domicilio_url} />
                                </td>

                                <td className="py-2 px-2 text-right">
                                    <button
                                        onClick={() => onOpenDetail(s)}
                                        className="px-3 py-1.5 rounded-xl border bg-[#7d9a76] text-white hover:bg-[#607859]"
                                    >
                                        Ver detalle
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
