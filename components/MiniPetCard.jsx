"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useToast } from "./FeedBack";

export default function MiniPetCard({ idMascota }) {
  const [mascota, setMascota] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const { show } = useToast();

  const API_BASE =
    (typeof window !== "undefined" && process.env.NEXT_PUBLIC_API_BASE) ||
    "http://localhost:8000";

  useEffect(() => {
    let alive = true;

    async function run() {
      setLoading(true);
      setErrorMsg(null);
      try {
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;

        const res = await fetch(
          `${API_BASE}/api/mascotas/detalles/${idMascota}/`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        let obj = null;
        if (Array.isArray(data)) {
          obj = data[0] ?? null;
        } else if (data && Array.isArray(data.results)) {
          obj = data.results[0] ?? null;
        } else {
          obj = data ?? null;
        }

        if (alive) setMascota(obj);
      } catch (e) {
        if (alive) setErrorMsg(e.message || "Error al obtener la mascota");
      } finally {
        if (alive) setLoading(false);
      }
    }

    run();
    return () => {
      alive = false;
    };
  }, [API_BASE, idMascota]);

  useEffect(() => {
    if (errorMsg) {
      show({
        title: "Error",
        message: "No se pudo cargar la mascota",
        variant: "error",
      });
    }
  }, [errorMsg, show]);

  if (loading) {
    return (
      <div className="w-full h-[200px] rounded-xl bg-gray-100 animate-pulse" />
    );
  }

  if (!mascota) {
    return (
      <div className="p-4 rounded-xl bg-gray-50 text-sm text-gray-600 text-center">
        No se encontró información de la mascota.
      </div>
    );
  }

  // Resolver foto
  let fotoSrc = null;
  const f = mascota.fotos;
  if (typeof f === "string") {
    fotoSrc = f;
  } else if (Array.isArray(f)) {
    const first = f[0];
    if (typeof first === "string") fotoSrc = first;
    else if (first && typeof first === "object") fotoSrc = first.url ?? null;
  } else if (f && typeof f === "object") {
    fotoSrc = f.url ?? null;
  }

  return (
    <div className="rounded-2xl overflow-hidden shadow-md bg-white text-center">
      {fotoSrc ? (
        <img
          src={fotoSrc}
          alt={mascota.nombre || "Mascota"}
          className="w-full h-[200px] object-cover"
        />
      ) : (
        <div className="w-full h-[200px] bg-gray-100 grid place-items-center text-gray-500 text-sm">
          Sin foto
        </div>
      )}
      <div className="flex justify-between items-center p-3 text-md font-semibold text-gray-800 shadow-md hover:shadow-xl transition">
        {mascota.nombre || `Mascota #${idMascota}`}
        <div>
            <Link href={`/mascotas/${idMascota}`}  className="inline-flex items-center px-4 py-2 rounded-2xl bg-[#e0795e] text-white hover:bg-[#C1643E]">Ver ficha</Link>
        </div>
      </div>
    </div>
  );
}
