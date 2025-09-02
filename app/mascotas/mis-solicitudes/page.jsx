"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import VeterinarioHeader from "@/components/VeterinarioHeader";

function formatDate(dt) {
  if (!dt) return "";
  const d = new Date(dt);
  return isNaN(d.getTime()) ? String(dt) : d.toLocaleString();
}
function boolStr(v) {
  if (v === true) return "Sí";
  if (v === false) return "No";
  return "—";
}

export default function SolicitudesAdopcionVet({ defaultPageSize = 10 }) {
  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [search, setSearch] = useState("");
  const [petId, setPetId] = useState("");
  const [detail, setDetail] = useState(null);

  const token = useMemo(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  }, []);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const endpoint = useMemo(
    () => `${baseUrl}/api/mascotas/solicitudes/mis-solicitudes/`,
    [baseUrl]
  );

  const controllerRef = useRef(null);

  const fetchData = async () => {
    if (!endpoint) return;
    setLoading(true);
    setError(null);

    if (controllerRef.current) controllerRef.current.abort();
    controllerRef.current = new AbortController();

    const qs = new URLSearchParams();
    if (search.trim()) qs.set("search", search.trim());
    if (petId.trim()) qs.set("pet_id", petId.trim());
    if (page > 1) qs.set("page", String(page));
    if (pageSize) qs.set("page_size", String(pageSize));

    try {
      const res = await fetch(`${endpoint}?${qs.toString()}`, {
        signal: controllerRef.current.signal,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setItems(json.results ?? []);
      setCount(json.count ?? (json.results?.length ?? 0));
    } catch (err) {
      if (err?.name !== "AbortError") setError(err?.message || "Error al cargar");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, page, pageSize]);

  
  const totalPages = useMemo(
    () => (pageSize ? Math.max(1, Math.ceil((count || 0) / pageSize)) : 1),
    [count, pageSize]
  );

  return (
    <div>
        <VeterinarioHeader />
        <div className="min-h-screen bg-gradient-to-b from-[#fff6f1] to-[#fdeee7]">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header / breadcrumb */}
        <header className="mb-6 flex items-center justify-between">
          <div>
            <nav className="text-sm text-[#6b7076]">
              <Link href="/veterinario" className="hover:underline">
                Panel
              </Link>
              <span className="mx-2">/</span>
              <span className="text-[#2b3136]/80">Solicitudes</span>
            </nav>
            <h1 className="mt-2 text-3xl md:text-4xl font-extrabold text-[#2b3136]">
              Solicitudes de mis mascotas
            </h1>
            <p className="text-sm text-[#6b7076] mt-1">
              {count ? `${count} resultado${count === 1 ? "" : "s"}` : "—"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-[#6b7076]">Por página</label>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="border rounded-xl px-2 py-1"
            >
              {[5, 10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </header>

        {/* Card principal */}
        <div className="bg-white rounded-2xl shadow p-6 md:p-8 space-y-6">
        
          {/* Tabla */}
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
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-[#6b7076]">
                      Cargando…
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-red-600">
                      {error}
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-[#6b7076]">
                      Sin solicitudes
                    </td>
                  </tr>
                ) : (
                  items.map((s) => (
                    <tr key={s.id} className="border-b">
                      <td className="py-2 px-2 whitespace-nowrap">
                        {formatDate(s.fecha_solicitud)}
                      </td>
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
                      <td className="py-2 px-2 space-x-2">
                        {s.id_oficial_url && (
                          <a className="underline text-[#2b3136]" href={s.id_oficial_url} target="_blank" rel="noreferrer">
                            ID
                          </a>
                        )}
                        {s.comprobante_domicilio_url && (
                          <a
                            className="underline text-[#2b3136]"
                            href={s.comprobante_domicilio_url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Comprobante
                          </a>
                        )}
                      </td>
                      <td className="py-2 px-2 text-right">
                        <button
                          onClick={() => setDetail(s)}
                          className="px-3 py-1.5 rounded-xl border hover:bg-gray-50"
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

          {/* Paginación */}
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm text-[#6b7076]">
              Página {page} de {totalPages}
            </div>
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
        </div>
      </div>

      {/* Modal Detalle */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDetail(null)} />
          <div className="relative z-10 w-[min(92vw,720px)] bg-white rounded-2xl shadow-2xl p-6">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-lg font-semibold text-[#2b3136]">
                Solicitud #{detail.id}
              </h2>
              <button
                onClick={() => setDetail(null)}
                className="px-3 py-1.5 rounded-xl border hover:bg-gray-50"
              >
                Cerrar
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <Field label="Fecha" value={formatDate(detail.fecha_solicitud)} />
              <Field label="Mascota" value={detail.mascota_nombre ?? String(detail.mascota)} />
              <Field label="Nombre" value={detail.nombre} />
              <Field label="Edad" value={detail.edad != null ? String(detail.edad) : "—"} />
              <Field label="Teléfono" value={detail.telefono || "—"} />
              <Field label="Email" value={detail.email || "—"} />
              <Field label="Vivienda" value={detail.vivienda || "—"} />
              <Field label="Protegida" value={boolStr(detail.protegida)} />
              <Field label="Es propia" value={boolStr(detail.es_propia)} />
              <Field label="Renta permite" value={boolStr(detail.renta_permite)} />
              <Field label="Horas solo" value={detail.horas_solo || "—"} />
              <Field label="Ejercicio" value={detail.ejercicio || "—"} />
              <Field label="Tuvo mascotas" value={boolStr(detail.tuvo_mascotas)} />
              <Field label="Familia de acuerdo" value={boolStr(detail.familia_de_acuerdo)} />
              <Field label="Compromiso de vida" value={boolStr(detail.compromiso_vida)} />
              <div className="md:col-span-2">
                <Field label="Mascotas actuales" value={detail.mascotas_actuales || "—"} />
              </div>
              <div className="md:col-span-2">
                <Field label="Motivo" value={detail.motivo || "—"} />
              </div>
              <div className="md:col-span-2 flex items-center gap-4 mt-2">
                {detail.id_oficial_url && (
                  <a className="underline" href={detail.id_oficial_url} target="_blank" rel="noreferrer">
                    Ver ID oficial
                  </a>
                )}
                {detail.comprobante_domicilio_url && (
                  <a className="underline" href={detail.comprobante_domicilio_url} target="_blank" rel="noreferrer">
                    Ver comprobante de domicilio
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-0.5 text-[#2b3136]">{value || "—"}</div>
    </div>
  );
}
