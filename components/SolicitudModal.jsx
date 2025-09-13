"use client";
import { useState } from "react";
import { useConfirm } from "./FeedBack";

function Badge({ children, color = "#7d9a76" }) {
    return (
        <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium text-white" style={{ backgroundColor: color }}>
            {children}
        </span>
    );
}

function Section({ title, children, full = false }) {
    return (
        <div className={full ? "md:col-span-2" : ""}>
            <h3 className="mb-3 text-sm font-semibold text-gray-700">{title}</h3>
            <div className="divide-y divide-gray-100 rounded-2xl border border-gray-100">{children}</div>
        </div>
    );
}

function Row({ label, value }) {
    const v = value ?? "—";
    const isBoolText = typeof v === "string" && (v === "Sí" || v === "No");

    return (
        <div className="grid grid-cols-1 items-start gap-1 p-3 sm:grid-cols-3">
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</dt>
            <dd className="sm:col-span-2 text-sm text-gray-800 flex items-center gap-2">
                {isBoolText ? (
                    <>
                        <span className={`h-2.5 w-2.5 rounded-full ${v === "Sí" ? "bg-emerald-500" : "bg-rose-500"}`} />
                        {v}
                    </>
                ) : v}
            </dd>
        </div>
    );
}

function Multiline({ value }) {
    return <div className="p-4"><p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">{value || "—"}</p></div>;
}

function FileLink({ href, label }) {
    if (!href) return <div className="rounded-2xl border border-dashed border-gray-200 p-4 text-sm text-gray-400">{label} (no adjunto)</div>;

    return (
        <a href={href} target="_blank" rel="noreferrer" className="group flex items-center justify-between rounded-2xl border border-gray-100 p-4 text-sm transition hover:bg-gray-50">
            <span className="font-medium text-gray-800">{label}</span>
            <span className="inline-flex items-center gap-2 text-gray-500 group-hover:text-gray-700">
                Abrir
                <svg width="18" height="18" viewBox="0 0 24 24"><path d="M7 17l9-9M16 16V8H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" /></svg>
            </span>
        </a>
    );
}

export default function SolicitudModal({ detail, onClose, onAccepted, baseUrl, token, formatDate, boolStr, show }) {
    const [accepting, setAccepting] = useState(false);
    const [rejecting, setRejecting] = useState(false);
    const confirm = useConfirm()

    async function handleAccept() {
        if (!detail) return;

        const ok = await confirm({
            title: "¿Aceptar solicitud?",
            description: `¿Estás seguro de aceptar esta solicitud"`,
            confirmText: "Sí, aceptar",
            cancelText: "Cancelar",
            variant: "danger",
        })

        if (!ok) return;

        try {
            setAccepting(true);
            const res = await fetch(`${baseUrl}/api/mascotas/adopciones/solicitudes/${detail.id}/aceptar/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });

            const payload = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(payload?.detail || `HTTP ${res.status}`);
            await onAccepted?.();
            show?.({ title: "Éxito", message: "Solicitud aceptada. La mascota fue marcada como adoptada.", variant: "success" });
            onClose();
        } catch (e) {
            show?.({ title: "Error", message: e?.message || "Error al aceptar la solicitud.", variant: "danger" });
        } finally {
            setAccepting(false);
        }
    }
    
    async function handleReject(){
        if(!detail) return;

        const ok = await confirm({
            title: "¿Rechazar solicitud?",
            description: `¿Estás seguro de rechazar esta solicitud"`,
            confirmText: "Sí, rechazar",
            cancelText: "Cancelar",
            variant: "danger",
        })

        if (!ok) return;

        try{
            setRejecting(true);
            const res = await fetch(`${baseUrl}/api/mascotas/adopciones/solicitudes/${detail.id}/rechazar/`,{
                method: "POST",
                headers:{
                    "Content-Type":"application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                }
            })

            const payload = await res.json().catch(() => ({}));

            if(!res.ok) throw new Error(payload?.detail || `HTTP ${res.status}`);
            show({ title: "Éxito", message: "La Solicitud ha sido rechazada", variant: "success" });
            onClose();
        }
        catch(e){
            show({ title: "Error", message: e?.message || "Error al rechazar la solicitud.", variant: "danger" })
        }
        finally{
            setRejecting(false);
        }

    }

    if (!detail) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center" role="dialog" aria-modal="true" onKeyDown={(e) => e.key === "Escape" && onClose()}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative z-10 w-[min(92vw,860px)] rounded-3xl border border-black/5 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.25)] animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col overflow-hidden">

                {/* Header */}
                <div className="flex items-center gap-4 p-6 border-b border-gray-100">
                    <div className="flex-1">
                        <h2 className="text-xl font-semibold tracking-tight text-[#2b3136]">Solicitud #{detail.id}</h2>
                        <p className="text-sm text-gray-500">{detail.mascota_nombre ?? String(detail.mascota)} · {formatDate?.(detail.fecha_solicitud)}</p>
                    </div>

                    <button onClick={onClose} className="group inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium bg-[#fceae0] text-gray-700 transition hover:bg-[#f8dfd2] active:scale-95" aria-label="Cerrar">
                        <svg width="18" height="18" viewBox="0 0 24 24" className="opacity-70 group-hover:opacity-100"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                        Cerrar
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="mb-5 flex flex-wrap items-center gap-2">
                        <Badge color="#7d9a76">{detail.vivienda || "Vivienda: —"}</Badge>
                        <Badge color="#d47451">Protegida: {boolStr?.(detail.protegida)}</Badge>
                        <Badge color="#7d9a76">Es propia: {boolStr?.(detail.es_propia)}</Badge>
                        <Badge color="#d47451">Permite renta: {boolStr?.(detail.renta_permite)}</Badge>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <Section title="Datos del solicitante">
                            <Row label="Nombre" value={detail.nombre} />
                            <Row label="Edad" value={detail.edad != null ? String(detail.edad) : "—"} />
                            <Row label="Teléfono" value={detail.telefono || "—"} />
                            <Row label="Email" value={detail.email || "—"} />
                            <Row label="Horas solo" value={detail.horas_solo || "—"} />
                            <Row label="Ejercicio" value={detail.ejercicio || "—"} />
                        </Section>

                        <Section title="Contexto del hogar">
                            <Row label="Vivienda" value={detail.vivienda || "—"} />
                            <Row label="Protegida" value={boolStr?.(detail.protegida)} />
                            <Row label="Es propia" value={boolStr?.(detail.es_propia)} />
                            <Row label="Renta permite" value={boolStr?.(detail.renta_permite)} />
                            <Row label="Tuvo mascotas" value={boolStr?.(detail.tuvo_mascotas)} />
                            <Row label="Familia de acuerdo" value={boolStr?.(detail.familia_de_acuerdo)} />
                            <Row label="Compromiso de vida" value={boolStr?.(detail.compromiso_vida)} />
                        </  Section>

                        <Section title="Mascotas actuales" full><Multiline value={detail.mascotas_actuales} /></Section>
                        <Section title="Motivo de adopción" full><Multiline value={detail.motivo} /></Section>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2 pb-6">
                        <FileLink href={detail.id_oficial_url} label="Ver ID oficial" />
                        <FileLink href={detail.comprobante_domicilio_url} label="Ver comprobante de domicilio" />
                    </div>
                </div>

                    {/* Footer */}
                    <div className="border-t border-gray-100 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60">
                        <div className="flex items-center justify-end gap-3 p-4">
                            <button onClick={handleReject} 
                                className="inline-flex items-center justify-center rounded-xl bg-[#7d9a76] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#607859] active:scale-95 disabled:opacity-60"
                                disabled={rejecting}
                            >
                                {rejecting ? "Rechazando..." : "Rechazar solicitud"}
                            </button>
                            <button
                                className="inline-flex items-center justify-center rounded-xl bg-[#7d9a76] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#607859] active:scale-95 disabled:opacity-60"
                                onClick={handleAccept}
                                disabled={accepting}
                            >
                                {accepting ? "Aceptando…" : "Aceptar solicitud"}
                            </button>
                        </div>
                    </div>
            </div>
        </div>
    );
}   
