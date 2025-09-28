"use client";
import { useState } from "react";

export default function TestCam() {
  const [msg, setMsg] = useState("");
  const [streamed, setStreamed] = useState(false);

  const probar = async () => {
    setMsg("Solicitando cámara…");
    try {
      // environment = cámara trasera si está disponible
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      setStreamed(true);
      setMsg("✅ Cámara concedida");
      // Limpia la cámara después de 5s (solo para la prueba)
      setTimeout(() => stream.getTracks().forEach(t => t.stop()), 5000);
    } catch (e) {
      // Errores típicos: NotAllowedError, NotFoundError, NotReadableError, SecurityError
      setMsg(`❌ ${e.name}: ${e.message || "Permiso denegado o bloqueado"}`);
    }
  };

  return (
    <div className="fixed bottom-4 left-0 right-0 z-50 grid place-items-center">
      <div className="max-w-lg w-[92vw] rounded-2xl bg-white/90 p-3 text-sm shadow">
        <button
          onClick={probar}
          className="px-4 py-2 rounded-xl bg-[#7d9a75] text-white hover:bg-[#607859]"
        >
          Probar cámara
        </button>
        <div className="mt-2">{msg}</div>
        {streamed && <div className="text-xs text-gray-500">Se liberará en 5s…</div>}
      </div>
    </div>
  );
}



/*
"use client";

import { useMemo, useEffect, useRef, useState, Suspense } from "react";
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
            <Script
                type="module"
                src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"
                strategy="afterInteractive"
                onLoad={() => setReady(true)}
            />

            <div className="fixed inset-0 bg-black">
                {ready ? (
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
    
                        <button slot="ar-button" className="px-4 py-2 rounded-xl bg-white/90 absolute bottom-6 left-1/2 -translate-x-1/2">
                            Ver en tu espacio (AR)
                        </button>
                        
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
*/