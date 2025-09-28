"use client";

import { useMemo, useEffect, useRef, useState, Suspense } from "react";
import Script from "next/script";
import { useSearchParams } from "next/navigation";

export const dynamic = "force-dynamic";

const GLB_HEIGHTS = { perro: 0.605, gato: 0.25 };

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
  const modelPath = useMemo(
    () => (typeParam === "gato" ? "/models/gato.glb" : "/models/perro.glb"),
    [typeParam]
  );

  const [ready, setReady] = useState(false);
  const ref = useRef(null);

  const glbHeight = GLB_HEIGHTS[typeParam] ?? 1.0;
  const scale = Math.max(0.001, (targetHeight / glbHeight) || 1.0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function onLoad() {
      try {
        const s = scale;
        const model = el.model;
        if (model?.scene) {
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
          // eslint-disable-next-line react/no-unknown-property
          <model-viewer
            ref={ref}
            src={modelPath}
            ar
            // solo Android: scene-viewer (app nativa) o webxr
            // eslint-disable-next-line react/no-unknown-property
            ar-modes="scene-viewer webxr"
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
          >
            {/* Botón AR (aparece en Android) */}
            {/* eslint-disable-next-line react/no-unknown-property */}
            <button slot="ar-button" className="px-4 py-2 rounded-xl bg-white/90 absolute bottom-6 left-1/2 -translate-x-1/2">
              Ver en tu espacio (AR)
            </button>
          </model-viewer>
        ) : (
          <div className="w-full h-full grid place-items-center text-white">
            Cargando visor…
          </div>
        )}
      </div>

      {/* Overlay info */}
      <div className="fixed bottom-3 left-0 right-0 z-50">
        <div className="mx-auto max-w-lg rounded-2xl bg-white/85 backdrop-blur shadow p-3 text-sm text-gray-800">
          <div>
            <b>Tipo:</b> {typeParam} • <b>Altura objetivo:</b> {targetHeight.toFixed(2)} m • <b>Scale:</b> {scale.toFixed(3)} • <b>Modelo:</b>{" "}
            {name || (typeParam === "gato" ? "Gato" : "Perro")}
          </div>
        </div>
      </div>
    </>
  );
}
