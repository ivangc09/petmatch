"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import EditarMascota from "@/components/EditarMascota";

export default function EditPetPage() {
  const { id } = useParams();                
  const [mascota, setMascota] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();

    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
        const res = await fetch(`${base}/api/mascotas/detalles/${id}/`, {
          cache: "no-store",
          signal: controller.signal,
        });
        if (res.status === 404) { setErr("Mascota no encontrada"); return; }
        if (!res.ok) throw new Error(`Error ${res.status}`);
        setMascota(await res.json());
      } catch (e) {
        if (e.name !== "AbortError") setErr(e.message || "Error al cargar");
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [id]);

  if (loading) return <div>Cargando…</div>;
  if (err) return <div className="text-red-600">Error: {err}</div>;
  if (!mascota) return null;

  return <EditarMascota mascota={mascota} />;
}
