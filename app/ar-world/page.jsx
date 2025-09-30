"use client";

import { Suspense, useMemo, useRef, useState, useEffect } from "react";
import Script from "next/script";
import { useSearchParams } from "next/navigation";

export const dynamic = "force-dynamic";

const DOG_MODELS = {
  chico: "/models/perro_chico.glb",
  mediano: "/models/perro_mediano.glb",
  grande: "/models/perro_grande.glb",
};
const CAT_MODEL = "/models/gato.glb";


function normalizeSize(raw) {
  const v = (raw || "").toLowerCase().trim();
  if (["chico", "pequeño", "pequeno", "small", "s", "1"].includes(v)) return "chico";
  if (["mediano", "medium", "m", "2"].includes(v)) return "mediano";
  if (["grande", "large", "l", "3"].includes(v)) return "grande";
  return "mediano";
}

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
  const sizeParam = normalizeSize(sp.get("height_m")); 
  const name = sp.get("name") || "";

  const modelPath = useMemo(() => {
    if (typeParam === "gato") return CAT_MODEL;
    return DOG_MODELS[sizeParam] || DOG_MODELS.mediano;
  }, [typeParam, sizeParam]);

  const [ready, setReady] = useState(false);
  const [arCapable, setArCapable] = useState(false);
  const [status, setStatus] = useState("checking");
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onArStatus = (e) => setStatus((e.detail && e.detail.status) || "unknown");
    el.addEventListener("ar-status", onArStatus);

    (async () => {
      try {
        const ok = await (el.canActivateAR && el.canActivateAR());
        setArCapable(!!ok);
        setStatus(ok ? "not-presenting" : "unsupported");
      } catch {
        setArCapable(false);
        setStatus("unsupported");
      }
    })();

    return () => {
      el.removeEventListener("ar-status", onArStatus);
    };
  }, [modelPath]);

  const launchAR = async () => {
    const el = ref.current;
    if (!el) return;
    try {
      await el.activateAR();
    } catch (e) {
      alert(
        "No se pudo abrir AR.\n\nTips Android:\n• Abre en Chrome (no navegador dentro de WhatsApp/Instagram).\n• Actualiza Google Chrome y Google Play Services for AR.\n• Asegúrate de que la página NO esté dentro de un iframe."
      );
      console.warn("activateAR() error:", e);
    }
  };

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
          // eslint-disable-next-line react/no-unknown-property
          <model-viewer
            ref={ref}
            src={modelPath}
            ar
            // eslint-disable-next-line react/no-unknown-property
            ar-modes="webxr scene-viewer"
            // eslint-disable-next-line react/no-unknown-property
            camera-controls
            // eslint-disable-next-line react/no-unknown-property
            environment-image="neutral"
            // eslint-disable-next-line react/no-unknown-property
            exposure="1"
            // eslint-disable-next-line react/no-unknown-property
            shadow-intensity="1"
            style={{ width: "100%", height: "100%", background: "transparent" }}
            // eslint-disable-next-line react/no-unknown-property
            ar-placement="floor"
            // eslint-disable-next-line react/no-unknown-property
            touch-action="pan-y"
          />
        ) : (
          <div className="w-full h-full grid place-items-center text-white">Cargando visor…</div>
        )}
      </div>

      {/* Botón AR */}
      <div className="fixed bottom-20 left-0 right-0 z-50 grid place-items-center">
        <button
          onClick={launchAR}
          className={`px-4 py-2 rounded-2xl text-white ${arCapable ? "bg-[#7d9a75] hover:bg-[#607859]" : "bg-gray-500"}`}
          title={arCapable ? "Abrir AR" : "Este navegador no soporta AR"}
        >
          Ver en tu espacio (AR)
        </button>
        <div className="mt-2 text-xs text-white/80">Estado AR: {status}</div>
      </div>

      {/* Overlay info */}
      <div className="fixed bottom-3 left-0 right-0 z-50">
        <div className="mx-auto max-w-lg rounded-2xl bg-white/85 backdrop-blur shadow p-3 text-sm text-gray-800">
          <div className="space-y-1">
            <div>
              <b>Tipo:</b> {typeParam}
              {typeParam === "perro" && (
                <>
                  {" "}
                  • <b>Tamaño:</b> {sizeParam}
                </>
              )}{" "}
              • <b>Modelo:</b> {name || (typeParam === "perro" ? `perro-${sizeParam}` : "gato")}
            </div>
            <div>
              {typeParam === "gato"
                ? "Modelo de gato fijo (escala 1.0 del GLB)."
                : "Modelo de perro por talla (escala 1.0 del GLB)."}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
