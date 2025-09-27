"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Script from "next/script";
import { useSearchParams } from "next/navigation";

// Alturas reales de los GLB aprox
const GLB_HEIGHTS = {
  perro: 0.605,
  gato:  0.25, 
};

function ARInner() {
  const sp = useSearchParams();

  // Parámetros de la URL
  const typeParam = (sp.get("type") || "perro").toLowerCase();
  const name = sp.get("name") || "";
  const markerCm = parseFloat((sp.get("marker") || "10").replace(",", "."));
  const defaultTarget = typeParam === "gato" ? 0.25 : 0.60;
  const targetHeight = parseFloat((sp.get("height_m") || `${defaultTarget}`).replace(",", "."));

  const [aframeReady, setAframeReady] = useState(false);
  const [arDetected, setArDetected] = useState(false);
  const [err, setErr] = useState("");

  const modelPath = useMemo(
    () => (typeParam === "gato" ? "/models/gato.glb" : "/models/perro.glb"),
    [typeParam]
  );

  const glbHeight = GLB_HEIGHTS[typeParam] ?? 1.0;
  const markerMeters = Math.max(0.02, (markerCm || 10) / 100);
  const scale = (targetHeight / glbHeight) || 1.0;
  const liftY = Math.max(0, targetHeight / 2);

  // Limpieza de cámara al salir
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
      else if (tries++ < 30) setTimeout(detect, 100); // ~3s
      else { console.warn("[AR] AR.js no se detectó explícitamente; monto escena igual."); setArDetected(true); }
    };
    detect();
  }, [aframeReady]);

  // Logs de cámara y modelo
  useEffect(() => {
    const scene = document.querySelector("a-scene");
    if (!scene) return;

    const onReady   = () => console.log("[AR] arReady ✅");
    const onError   = (e) => console.error("[AR] arError ❌", e.detail || e);
    const onCamInit = (e) => console.log("[AR] camera-init ✅", e.detail || "");
    const onCamSet  = (e) => console.log("[AR] camera-set-active ✅", e.detail || "");

    scene.addEventListener("arReady", onReady);
    scene.addEventListener("arError", onError);
    scene.addEventListener("camera-init", onCamInit);
    scene.addEventListener("camera-set-active", onCamSet);

    const pet = document.getElementById("pet");
    const ok  = () => console.log("[GLB] model-loaded ✅");
    const fail= (e) => console.error("[GLB] model-error ❌", e?.detail || e);
    pet?.addEventListener("model-loaded", ok);
    pet?.addEventListener("model-error", fail);

    return () => {
      scene.removeEventListener("arReady", onReady);
      scene.removeEventListener("arError", onError);
      scene.removeEventListener("camera-init", onCamInit);
      scene.removeEventListener("camera-set-active", onCamSet);
      pet?.removeEventListener("model-loaded", ok);
      pet?.removeEventListener("model-error", fail);
    };
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
      {/* AR.js (CDN + fallback local) */}
      <Script
        src="https://cdn.jsdelivr.net/npm/@ar-js-org/ar.js@3.4.5/aframe/build/aframe-ar.min.js"
        strategy="afterInteractive"
        onError={() => {
          console.warn("AR.js CDN falló; intento local…");
          const l = document.createElement("script");
          l.src = "/vendor/ar/aframe-ar.min.js"; // coloca aquí tu copia local si la usas
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
            arjs="sourceType: webcam; facingMode: environment; detectionMode: mono; maxDetectionRate: 30; displayWidth: 1280; displayHeight: 720; sourceWidth: 1280; sourceHeight: 720;"
            className="w-full h-full"
            onloaded={() => console.log("[AR] a-scene loaded")}
          >
            {/* Luces */}
            <a-entity light="type: ambient; intensity: 0.8"></a-entity>
            <a-entity position="0 1 0" light="type: directional; intensity: 0.9"></a-entity>

            {/* Marcador HIRO con tamaño físico real */}
            <a-marker preset="hiro" size={markerMeters}>
              {/* Cubo de prueba (puedes quitarlo) */}
              <a-box position="0 0.2 0" depth="0.4" height="0.4" width="0.4" color="#22c55e" opacity="0.18"></a-box>

              {/* Modelo (URL directa + decoders opcionales en el mismo atributo) */}
              <a-entity
                id="pet"
                gltf-model={`src: url(${modelPath}); dracoDecoderPath: https://www.gstatic.com/draco/v1/decoders/; meshoptDecoderPath: https://unpkg.com/meshoptimizer/`}
                scale={`${scale.toFixed(3)} ${scale.toFixed(3)} ${scale.toFixed(3)}`}
                position={`0 ${liftY.toFixed(3)} 0`}
                rotation="0 0 0"
              ></a-entity>
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
                  <li>Usa HIRO oficial y mide el borde negro. Ej.: <code>?marker=10</code> si son 10&nbsp;cm.</li>
                  {/*<li>Si usas AR.js local, confirma <code>/public/vendor/ar/aframe-ar.min.js</code>.</li>*/}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Overlay simple con recordatorio de parámetros */}
      <div className="fixed bottom-3 left-0 right-0 z-50">
        <div className="mx-auto max-w-lg rounded-2xl bg-white/85 backdrop-blur shadow p-3 text-sm text-gray-800">
          <div>
            <b>Tipo:</b> {typeParam} • <b>Marker:</b> {markerCm} cm • <b>Altura objetivo:</b> {targetHeight} m • <b>Scale aplicado:</b> {scale.toFixed(3)}
          </div>
          <div className="mt-1">
            Ejemplos: <code>/ar?type=perro&marker=10&height_m=0.75</code> • <code>/ar?type=gato&marker=10&height_m=0.25</code>
          </div>
        </div>
      </div>
    </>
  );
}

export default dynamic(() => Promise.resolve(ARInner), { ssr: false });
