"use client";

import { useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/FeedBack";
import VeterinarioHeader from "./VeterinarioHeader";

export default function EditPetForm({ mascota }) {
    const { show } = useToast();
    const [form, setForm] = useState({
        nombre: mascota?.nombre ?? "",
        especie: mascota?.especie ?? "",
        raza: mascota?.raza ?? "",
        edad: mascota?.edad ?? "",
        tamaño: mascota?.tamaño ?? "",
        sexo: mascota?.sexo ?? "",
        descripcion: mascota?.descripcion ?? "",
        estado: mascota?.estado ?? "",
    });
    const [foto, setFoto] = useState(null);
    const [saving, setSaving] = useState(false);
    const [ok, setOk] = useState(false);
    const [error, setError] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});

    const fotoUrl = Array.isArray(mascota.fotos) ? mascota.fotos[0] : mascota.fotos;
    const preview = foto ? URL.createObjectURL(foto) : (fotoUrl || "/img/placeholder.png");

    function onField(key, value) {
        setOk(false);
        setError(null);
        setFieldErrors({});
        setForm(prev => ({ ...prev, [key]: value }));
    }

    async function onSubmit(e) {
        e.preventDefault();
        setSaving(true);
        setOk(false);
        setError(null);
        setFieldErrors({});

        try {
            const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
            const token = localStorage.getItem("token");

            const fd = new FormData();
            Object.entries(form).forEach(([k, v]) => fd.append(k, v ?? ""));
            if (foto) fd.append("fotos", foto);

            const res = await fetch(`${base}/api/mascotas/${mascota.id}/editar/`, {
                method: "PATCH",
                headers: token ? { Authorization: `Bearer ${token}` } : undefined, 
                body: fd,
            });

            if (res.ok) {
                setOk(true);
                show?.({ title: "Guardado", message: "Cambios aplicados.", variant: "success" });
            } else {
                let data = null;
                try { data = await res.json(); } catch {}
                if (data && typeof data === "object") {
                    setFieldErrors(data);
                    setError("Revisa los campos.");
                } else {
                    const msg = (await res.text().catch(() => "")) || `Error ${res.status}`;
                    setError(msg);
                }
            }
            } catch (err) {
                setError(err.message || "Error de red");
                show?.({ title: "Error", message: err.message || "Error de red", variant: "error" });
            } finally {
                setSaving(false);
            }
    }

    return (
        <div>
            <VeterinarioHeader />
            <div className="min-h-screen bg-gradient-to-b from-[#fff6f1] to-[#fdeee7]">
                <div className="mx-auto max-w-6xl px-4 py-8">
                    <header className="mb-6 flex items-center justify-between">
                        <nav className="text-sm text-[#6b7076]">
                            <Link href="/veterinario" className="hover:underline">Panel</Link>
                            <span className="mx-2">/</span>
                            <Link href={`/mascotas/${mascota.id}`} className="hover:underline">{mascota?.nombre ?? "Mascota"}</Link>
                            <span className="mx-2">/</span>
                            <span className="text-ink/80">Editar</span>
                        </nav>
                        <Link href={`/mascotas/${mascota.id}`} className="rounded-xl px-4 py-2 bg-[#fceae0] text-[#9f5b53] hover:bg-[#f8dfd2]">
                            ← Volver
                        </Link>
                    </header>

                    <h1 className="text-3xl md:text-4xl font-extrabold text-[#2b3136] mb-4">Editar información</h1>
                    <p className="text-[#6b7076] mb-6">Actualiza los datos de {mascota?.nombre} y guarda los cambios.</p>

                    <div className="bg-white rounded-2xl shadow p-6 md:p-8 grid md:grid-cols-2 gap-8">  
                        <div className="flex flex-col items-center gap-4">
                            <img
                                src={preview}
                                alt={`Foto de ${mascota?.nombre || "Mascota"}`}
                                className="w-[300px] h-[300px] md:w-[400px] md:h-[400px] object-center rounded-2xl border"
                            />
                            <label className="inline-flex items-center gap-2 rounded-xl px-4 py-2 bg-[#fceae0] text-[#9f5b53] hover:bg-[#f8dfd2] cursor-pointer">
                                Cambiar foto
                                <input type="file" accept="image/*" className="hidden" onChange={e=>setFoto(e.target.files?.[0]||null)} />
                            </label>
                        </div>
                        
                        <div className="font-['Poppins']">
                            <form onSubmit={onSubmit} className="space-y-4">
                                <div>
                                    <label className="block font-semibold mb-1">Nombre:</label>
                                    <input
                                        value={form.nombre}
                                        onChange={e => onField("nombre", e.target.value)}
                                        placeholder="Nombre"
                                        className="w-full border rounded px-3 py-2"
                                    />
                                    {fieldErrors.nombre && <p className="text-red-600 text-sm">{String(fieldErrors.nombre)}</p>}
                                </div>

                                <div>
                                    <label className="block font-semibold mb-1">Raza:</label>
                                    <input
                                        value={form.raza}
                                        onChange={e => onField("raza", e.target.value)}
                                        placeholder="Raza"
                                        className="w-full border rounded px-3 py-2"
                                    />
                                    {fieldErrors.raza && <p className="text-red-600 text-sm">{String(fieldErrors.raza)}</p>}
                                </div>

                                <div>
                                    <label className="block font-semibold mb-1">Edad:</label>
                                    <input
                                        type="number"
                                        value={form.edad}
                                        onChange={e => onField("edad", e.target.value)}
                                        placeholder="Edad"
                                        className="w-full border rounded px-3 py-2"
                                    />
                                    {fieldErrors.edad && <p className="text-red-600 text-sm">{String(fieldErrors.edad)}</p>}
                                </div>

                                <div>
                                    <label className="block font-semibold mb-1">Descripción:</label>
                                    <textarea
                                        value={form.descripcion}
                                        onChange={e => onField("descripcion", e.target.value)}
                                        placeholder="Descripción"
                                        className="w-full border rounded px-3 py-2"
                                    />
                                    {fieldErrors.descripcion && <p className="text-red-600 text-sm">{String(fieldErrors.descripcion)}</p>}
                                </div>

                                <div className="flex justify-end mt-4">
                                    <button disabled={saving} className="px-4 py-2 rounded bg-[#7d9a75] text-white disabled:opacity-60 cursor-pointer hover:bg-[#607859] transition-colors">
                                        {saving ? "Guardando..." : "Guardar cambios"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            
        </div>
    );
}