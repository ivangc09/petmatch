"use client";

import { useMemo, useEffect, useRef, useState } from "react";
import Script from "next/script";
import { useSearchParams } from "next/navigation";

export const dynamic = "force-dynamic"; 

const GLB_HEIGHTS = {
    perro: 0.605,
    gato:  0.25,
};

export default function ARWorldPage() {
    return (
        <Suspense fallback={<div className="fixed inset-0 grid place-items-center text-white bg-black">Cargando…</div>}>
            <ArWorldInner />
        </Suspense>
    );
}

function ArWorldInner() {
    const sp = useSearchParams();

    const typeParam = (sp.get("type") || "perro").toLowerCase();
    const defaultTarget = typeParam === "gato" ? 0.28 : 0.55;
    const targetHeight = parseFloat((sp.get("height_m") || `${defaultTarget}`).replace(",", "."));
    const name = sp.get("name") || "";
    const usdzSrc = sp.get("usdz") || "";
    const modelPath = useMemo(
        () => (typeParam === "gato" ? "/models/gato.glb" : "/models/perro.glb"),
        [typeParam]
    );

    const [ready, setReady] = useState(false);
    const ref = useRef(null);

    // Calcula escala relativa al tamaño real del GLB
    const glbHeight = GLB_HEIGHTS[typeParam] ?? 1.0;
    const scale = Math.max(0.001, (targetHeight / glbHeight) || 1.0);

    // Cuando cargue el modelo, aplica escala por escena-gráfica
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        
        function onLoad() {
            try {
                const s = scale;
                const model = el.model;
                if (model && model.scene) {
                    model.scene.scale.set(s, s, s);
                }
            } catch (e) {
                
                console.warn("No se pudo aplicar escala vía scene-graph:", e);
            }
        }

        el.addEventListener("load", onLoad);
        return () => el.removeEventListener("load", onLoad);
    }, [scale]);

    return (
        <>
            {/* Carga model-viewer */}
            <Script
                type="module"
                src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"
                strategy="afterInteractive"
                onLoad={() => setReady(true)}
            />

            <div className="fixed inset-0 bg-black">
                {ready ? (
                  // eslint-disable-next-line react/no-unknown-property
                    <model-viewer
                        ref={ref}
                        src={modelPath}
                        usdz-src={usdzSrc || undefined}
                        ar
                        ar-modes="webxr scene-viewer quick-look"
                        camera-controls
                        environment-image="neutral"
                        exposure="1"
                        shadow-intensity="1"
                        style={{ width: "100%", height: "100%", background: "black" }}
                        ar-placement="floor"
                        touch-action="pan-y"
                    >
                        {/* eslint-disable-next-line react/no-unknown-property */}
                        <button slot="ar-button" className="px-4 py-2 rounded-xl bg-white/90 absolute bottom-6 left-1/2 -translate-x-1/2">
                            Ver en tu espacio (AR)
                        </button>
                        {/* eslint-disable-next-line react/no-unknown-property */}
                        <div slot="ar-prompt" className="absolute bottom-20 left-1/2 -translate-x-1/2 text-white text-sm">
                            Mueve el teléfono para detectar el piso
                        </div>
                    </model-viewer>
                ) : (
                    <div className="w-full h-full grid place-items-center text-white">
                        Cargando visor…
                    </div>
                )}
            </div>
            
            {/* Overlay con datos */}
            <div className="fixed bottom-3 left-0 right-0 z-50">
                <div className="mx-auto max-w-lg rounded-2xl bg-white/85 backdrop-blur shadow p-3 text-sm text-gray-800">
                    <div>
                        <b>Tipo:</b> {typeParam} • <b>Altura objetivo:</b> {targetHeight.toFixed(2)} m • <b>Scale aplicado:</b> {scale.toFixed(3)} • <b>Modelo:</b>{" "}
                        {name || (typeParam === "gato" ? "Gato" : "Perro")}
                    </div>
                    {!!usdzSrc && <div className="mt-1">USDZ: {usdzSrc}</div>}
                </div>
            </div>
        </>
    );
}