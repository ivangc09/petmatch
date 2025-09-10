// app/ar/page.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Script from "next/script";
import { useSearchParams } from "next/navigation";

const SIZE_PRESETS = {
  perro: { chico: 0.45, mediano: 0.60, grande: 0.75 },
  gato:  { chico: 0.22, mediano: 0.25, grande: 0.28 },
};

function ARInner() {
  const sp = useSearchParams();
  const typeParam = (sp.get("type") || "perro").toLowerCase();
  const name = sp.get("name") || "";

  const [aframeReady, setAframeReady] = useState(false);
  const [arDetected, setArDetected] = useState(false);
  const [err, setErr] = useState("");
  const [talla, setTalla] = useState("mediano");
  const [fine, setFine] = useState(1);

  const { modelPath, baseScale } = useMemo(() => {
    if (typeParam === "gato") return { modelPath: "/models/gato.glb", baseScale: 1.0 };
    return { modelPath: "/models/perro.glb", baseScale: 1.0 };
  }, [typeParam]);

  const targetMeters = SIZE_PRESETS[typeParam]?.[talla] ?? SIZE_PRESETS.perro.mediano;
  const effectiveScale = (baseScale * targetMeters * fine).toFixed(3);

  useEffect(() => {
    return () => {
      document.querySelectorAll("video").forEach(v => {
        try { v.srcObject && v.srcObject.getTracks().forEach(t => t.stop()); } catch {}
      });
    };
  }, []);

  // Detectar A-Frame
  useEffect(() => {
    const t = setInterval(() => {
      if (typeof window !== "undefined" && window.AFRAME) {
        setAframeReady(true);
        clearInterval(t);
      }
    }, 100);
    return () => clearInterval(t);
  }, []);

  // Detectar AR.js (varias rutas posibles)
  useEffect(() => {
    if (!aframeReady) return;
    let tries = 0;
    const detect = () => {
      const A = window.AFRAME;
      const ok = !!(window.ARjs || A?.components?.arjs || A?.systems?.arjs);
      if (ok) setArDetected(true);
      else if (tries++ < 30) setTimeout(detect, 100);      // ~3s
      else { console.warn("[AR] AR.js no se detectó explícitamente; monto escena igual."); setArDetected(true); }
    };
    detect();
  }, [aframeReady]);

  // Logs de carga del modelo para depurar
  useEffect(() => {
    const el = document.getElementById("pet");
    if (!el) return;
    const ok = () => console.log("[GLB] model-loaded ✅");
    const fail = (e) => console.error("[GLB] model-error ❌", e?.detail || e);
    el.addEventListener("model-loaded", ok);
    el.addEventListener("model-error", fail);
    return () => { el.removeEventListener("model-loaded", ok); el.removeEventListener("model-error", fail); };
  });

  const canMountScene = aframeReady && arDetected;

  return (
    <>
      {/* A-Frame */}
      <Script
        src="https://aframe.io/releases/1.5.0/aframe.min.js"
        strategy="afterInteractive"
        onError={() => setErr("No cargó A-Frame. Revisa conexión o bloqueadores.")}
      />

      {/* AR.js (CDN con fallback a archivo local en /public/vendor/ar/aframe-ar.min.js) */}
      <Script
        src="https://cdn.jsdelivr.net/npm/@ar-js-org/ar.js@3.4.5/aframe/build/aframe-ar.min.js"
        strategy="afterInteractive"
        onError={() => {
          console.warn("AR.js CDN falló; intento local…");
          const l = document.createElement("script");
          l.src = "/vendor/ar/aframe-ar.min.js";
          l.onload = () => console.log("AR.js local cargado ✅");
          l.onerror = () => setErr("No se pudo cargar AR.js ni desde CDN ni local.");
          document.body.appendChild(l);
        }}
      />

      <div className="fixed inset-0">
        {canMountScene ? (
          <a-scene
            vr-mode-ui="enabled: false"
            embedded
            renderer="colorManagement: true, physicallyCorrectLights: true"
            arjs="sourceType: webcam; debugUIEnabled: false; detectionMode: mono; maxDetectionRate: 30;"
            className="w-full h-full"
            onloaded={() => console.log("[AR] a-scene loaded")}
          >
            {/* Luces */}
            <a-entity light="type: ambient; intensity: 0.8"></a-entity>
            <a-entity position="0 1 0" light="type: directional; intensity: 0.9"></a-entity>

            {/* Marcador Hiro 10 cm (0.1 m) */}
            <a-marker preset="hiro" size="0.1">
              {/* Cubo de prueba (confirma render sobre el marker) */}
              <a-box position="0 0.05 0" depth="0.1" height="0.1" width="0.1" color="#ff7043" opacity="0.4"></a-box>

              {/* Modelo: URL directa + decoders opcionales en el mismo atributo */}
              <a-entity
                id="pet"
                gltf-model={`src: url(${modelPath}); dracoDecoderPath: https://www.gstatic.com/draco/v1/decoders/; meshoptDecoderPath: https://unpkg.com/meshoptimizer/`}
                scale="10.24 10.24 10.24"
                position="0 0 0"
                rotation="0 0.30 0"
                animation__spin="property: rotation; to: 0 360 0; loop: true; dur: 20000; easing: linear"
              ></a-entity>

              <a-plane position="0 0 0" rotation="-90 0 0" width="0.6" height="0.6" color="#cccccc" opacity="0.15"></a-plane>
            </a-marker>

            {/* Cámara */}
            <a-entity camera></a-entity>
          </a-scene>
        ) : (
          <div className="w-full h-full grid place-items-center text-center p-6">
            <div>
              <p className="text-lg font-medium">Cargando AR…</p>
              {!!err && <p className="text-sm text-red-600 mt-2">{err}</p>}
              <div className="text-sm text-gray-700 mt-2">
                Tips:
                <ul className="list-disc text-left ml-6 mt-1 space-y-1">
                  <li>Abre en <b>https</b> o <b>http://localhost</b>.</li>
                  <li>Permite el acceso a la <b>cámara</b>.</li>
                  <li>Desactiva bloqueadores/extensiones y prueba en incógnito.</li>
                  <li>Si usas archivo local de AR.js, confirma que existe en <code>/public/vendor/ar/aframe-ar.min.js</code>.</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Overlay UI */}
      <div className="fixed top-0 left-0 right-0 p-3 md:p-4 z-50">
        <div className="mx-auto max-w-lg rounded-2xl bg-white/85 backdrop-blur shadow p-3 md:p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm text-gray-600">AR (beta) con marcador</div>
              <div className="font-semibold">
                {name ? `Viendo: ${name}` : typeParam === "gato" ? "Gato genérico" : "Perro genérico"}
              </div>
            </div>
            <a href="/markers/Hiro.pdf" target="_blank" className="text-sm underline text-[#607859]">
              Marcador (10×10 cm)
            </a>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm font-medium">Talla:</span>
            {["chico", "mediano", "grande"].map((t) => (
              <button
                key={t}
                onClick={() => setTalla(t)}
                className={`px-3 py-1 rounded-full text-sm border ${
                  talla === t ? "bg-[#7d9a75] text-white border-[#7d9a75]" : "bg-white text-gray-800 border-gray-300"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="mt-3">
            <label className="text-sm font-medium">
              Ajuste fino: <span className="tabular-nums">{Number(fine).toFixed(2)}×</span>
            </label>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.01"
              value={fine}
              onChange={(e) => setFine(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="text-xs text-gray-600 mt-1">Scale efectiva: <b>{effectiveScale}</b></div>
          </div>
        </div>
      </div>
    </>
  );
}

export default dynamic(() => Promise.resolve(ARInner), { ssr: false });
