"use client";

import { useEffect,useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import VeterinarioHeader from "@/components/VeterinarioHeader";
import Comentarios from "@/components/Comentarios";
import { useConfirm, useToast, AlertBanner } from "@/components/FeedBack";

export default function VetPetProfile( { mascota } ) {
    const router = useRouter();
    const confirm = useConfirm();
    const { show } = useToast();
    const { id, nombre, fotos, edad, sexo, raza, tamaño, descripcion } = mascota;

    const [token, setToken] = useState(null);
    const [active, setActive] = useState(0);
    const [status, setStatus] = useState("idle");
    const [error, setError] = useState(null);

    const mainImg = Array.isArray(fotos)
    ? (fotos[active] ?? "/placeholder-pet.jpg")
    : (fotos ?? "/placeholder-pet.jpg");


    useEffect(() => {
        const t = localStorage.getItem("token")
        if (t) setToken(t);

    }, []);

    const onDelete = async () => {
        setStatus("loading");
        setError(null);

        const ok = await confirm({
            title: "¿Eliminar mascota?",
            description: `¿Estás seguro de eliminar a ${nombre}"`,
            confirmText: "Sí, eliminar",
            cancelText: "Cancelar",
            variant: "danger",
        })

        if (!ok) return;    

        try{
            const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
            const res = await fetch(`${base}/api/mascotas/${id}/eliminar/`, {
                method: "DELETE",
                headers: { Authorization : `Bearer ${token}` }
            });

            if(res.ok){
                setStatus("success");
                show({ title: "Listo", message: "Mascota eliminada.", variant: "success" });
                setTimeout(() => router.push("/veterinario"), 1200);

            }
            else{
                const msg = (await res.text().catch(() => "")) || `Error ${res.status}`;
                setError(msg);
                setStatus("error");
                show({ title: "Error al eliminar", message: msg, variant: "error" });
            }
        }
        catch(err){
            setError(err.message || "Error al eliminar la mascota");
            setStatus("error");
            show({ title: "Error", message: msg, variant: "error" });

        }
    }

    return (
        <div>
            <VeterinarioHeader />
            <div className="min-h-screen bg-gradient-to-b from-[#fff6f1] to-[#fdeee7]">
                <div className="mx-auto max-w-6xl px-4 py-8">

                    {status === "success" && (
                        <AlertBanner variant="success">
                            Mascota eliminada correctamente.{" "}
                            <Link href="/veterinario" className="underline">Volver al panel</Link>
                        </AlertBanner>
                    )}
                    {status === "error" && (
                        <AlertBanner variant="error">
                            {error || "Ocurrió un error al eliminar."}
                        </AlertBanner>
                    )}


                    {/* Encabezado */}
                    <header className="mb-6">
                        <nav className="text-sm text-[#6b7076]">
                            <Link href="/veterinario" className="hover:underline">Panel</Link>
                            <span className="mx-2">/</span>
                            <span className="mx-2 font-medium">{mascota.nombre}</span>
                        </nav>
                    </header>
                    <div className="flex items-center justify-between mb-6">
                        
                        <div>
                            <h1 className="text-4xl md:text-5xl font-extrabold text-[#2b3136]">{nombre}</h1>
                            <p className="text-[#6b7076] mt-2 capitalize">
                                {raza || "-"} • {sexo || "-"} • {tamaño || "-"}
                            </p>
                        </div>
                        <Link href="/veterinario" className="rounded-xl px-4 py-2 bg-[#fceae0] text-[#9f5b53] hover:bg-[#f8dfd2]">
                            ← Volver
                        </Link>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Columna principal */}
                        <section className="lg:col-span-2">
                            {/* Galería */}
                            <div className="rounded-2xl overflow-hidden shadow-lg bg-white">
                            <img
                                src={mainImg}
                                alt={`Foto de ${nombre}`}
                                className="w-full h-[360px] md:h-[440px] object-center"
                            />
                            {Array.isArray(fotos) && fotos.length > 1 && (
                            <div className="flex gap-3 p-4 overflow-x-auto">
                                {fotos.map((src, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setActive(i)}
                                        className={`h-20 w-28 flex-shrink-0 rounded-xl overflow-hidden border transition ${
                                            active === i ? "border-[#e0795e] ring-2 ring-[#f6b19f]" : "border-gray-200"
                                        }`}
                                        aria-label={`Miniatura ${i + 1}`}
                                    >
                                    <img src={src} alt="" className="h-full w-full object-center" />
                                    </button>
                                ))}
                            </div>
                            )}
                            </div>
                    
                                {/* Chips */}
                                <div className="flex flex-wrap gap-2 mt-6">
                                    <Chip>{edad ? `${edad} años` : "Edad -"}</Chip>
                                    <Chip>{sexo || "Sexo -"}</Chip>
                                    <Chip>{tamaño || "Tamaño -"}</Chip>
                                    <Chip>{raza || "Raza -"}</Chip>
                                </div>
                    
                                {/* Descripción */}
                                <div className="mt-6 rounded-2xl bg-white shadow p-6">
                                    <h2 className="text-2xl font-bold text-[#2b3136]">Sobre {nombre}</h2>
                                    <p className="mt-3 text-[#61666b] leading-relaxed">
                                        {descripcion || "Sin descripción disponible por el momento."}
                                    </p>
                                </div>
                                <Comentarios mascotaId={id} />
                            </section>
                        {/* Sidebar */}
                        <aside className="lg:col-span-1 space-y-6 lg:sticky lg:top-6 h-max">
                            <div className="rounded-2xl bg-white shadow p-6">
                                <h3 className="text-xl font-bold text-[#2b3136]">¿Te gustaría modificar algo?</h3>
                                <div className="mt-4 flex flex-col gap-3">
                                    <Link
                                        href={`/mascotas/${id}/editar`}
                                        className="inline-flex items-center justify-center rounded-xl px-5 py-3 bg-[#7d9a75] text-white hover:bg-[#607859] transition-colors"
                                    >
                                        Editar información
                                    </Link>

                                    <button
                                    onClick={onDelete}
                                    className="inline-flex items-center justify-center rounded-xl px-5 py-3 bg-[#e0795e] text-white hover:bg-[#D3764C] transition-colors">
                                        {status === "loading" ? "Eliminando…" : "Eliminar"}
                                    </button>
                                </div>
                            </div>
                        </aside>
                    </div>

                </div>
            </div>
        </div>
    )
}

function Chip({ children }) {
    return (
        <span className="px-3 py-1 rounded-full bg-[#7d9a75] text-[#f3f4f6] text-sm">
            {children}
        </span>
    );
}