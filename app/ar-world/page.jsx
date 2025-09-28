"use client";

import { useMemo, useEffect, useRef, useState, Suspense } from "react";
import Script from "next/script";
import { useSearchParams } from "next/navigation";

export const dynamic = "force-dynamic";

const GLB_HEIGHTS = { perro: 0.605, gato: 0.25 };
const GLB_LENGTHS = { perro: 1.00, gato: 0.25 };

export default function ARWorldPage() {
  return (
    <Suspense fallback={<div className="fixed inset-0 grid place-items-center text-white bg-black">Cargando…</div>}>
      <ArWorldInner />
    </Suspense>
  );
}

function ArWorldInner() {
  const sp = useSearchParams();

  const typeParam = (sp.get("type") || "perro").toLowerCase(); // "perro" | "gato"
  const name = sp.get("name") || "";

  // Perros: altura objetivo (por talla). Default mediano 0.55 m
  const defaultDogHeight = 0.55;
  const targetHeightDog = parseFloat((sp.get("height_m") || `${defaultDogHeight}`).replace(",", "."));

  // Gatos: 2 restricciones → largo efectivo y altura
  const defaultCatLength = 0.50; // 50 cm (cabeza-cuerpo 46 + cola parcial)
  const targetLengthCat = parseFloat((sp.get("length_m") || `${defaultCatLength}`).replace(",", "."));
  const targetHeightCat = 0.24;  // 24 cm al hombro (puedes hacer param si quieres)

  const modelPath = useMemo(
    () => (typeParam === "gato" ? "/models/gato.glb" : "/models/perro.glb"),
    [typeParam]
  );

  const [ready, setReady] = useState(false);
  const [arCapable, setArCapable] = useState(false);
  const [status, setStatus] = useState("checking");
  const ref = useRef(null);

  const scale = useMemo(() => {
    if (typeParam === "gato") {
      const baseLen = GLB_LENGTHS.gato || 1.0;
      const baseHei = GLB_HEIGHTS.gato || 1.0;
      const sLen = (targetLengthCat || defaultCatLength) / baseLen;
      const sHei = (targetHeightCat) / baseHei;
      return Math.max(0.001, Math.min(sLen, sHei));
    } else {
      const baseHei = GLB_HEIGHTS.perro || 1.0;
      const h = (targetHeightDog || defaultDogHeight);
      return Math.max(0.001, h / baseHei);
    }
  }, [typeParam, targetLengthCat, targetHeightCat, targetHeightDog]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onLoad = () => {
      try {
        const model = el.model;
        if (model?.scene) model.scene.scale.set(scale, scale, scale);
      } catch (e) {
        console.warn("Escala scene-graph:", e);
      }
    };

    const onArStatus = (e) => setStatus(e.detail?.status || "unknown");

    el.addEventListener("load", onLoad);
    el.addEventListener("ar-status", onArStatus);

    (async () => {
      try {
        const ok = await el.canActivateAR?.();
        setArCapable(!!ok);
        setStatus(ok ? "not-presenting" : "unsupported");
      } catch {
        setArCapable(false);
        setStatus("unsupported");
      }
    })();

    return () => {
      el.removeEventListener("load", onLoad);
      el.removeEventListener("ar-status", onArStatus);
    };
  }, [scale]);

  const launchAR = async () => {
    const el = ref.current;
    if (!el) return;
    try {
      await el.activateAR(); // Android: Scene Viewer / WebXR
    } catch (e) {
      alert(
        "No se pudo abrir AR.\n\nTips Android:\n• Abre en Chrome (no navegador dentro de WhatsApp/Instagram).\n• Actualiza Google Chrome y Google Play Services for AR.\n• Asegúrate de que la página NO esté dentro de un iframe."
      );
      console.warn("activateAR() error:", e);
    }
  };

  // Info para overlay
  const infoLine =
    typeParam === "gato"
      ? `Largo objetivo: ${targetLengthCat.toFixed(2)} m • Altura máx: ${targetHeightCat.toFixed(2)} m • Scale: ${scale.toFixed(3)}`
      : `Altura objetivo: ${targetHeightDog.toFixed(2)} m • Scale: ${scale.toFixed(3)}`;

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
            // Solo Android
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

      {/* Botón AR siempre visible */}
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
            <div><b>Tipo:</b> {typeParam} • <b>Modelo:</b> {name || (typeParam === "gato" ? "Gato" : "Perro")}</div>
            <div>{infoLine}</div>
          </div>
        </div>
      </div>
    </>
  );
}
