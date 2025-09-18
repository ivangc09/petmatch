"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { GoogleMap, Marker, InfoWindow, useLoadScript } from "@react-google-maps/api";

const DEFAULT_CENTER = { lat: 19.432608, lng: -99.133209 }; // CDMX como fallback
const MAP_LIBRARIES = ["places"];
const CONTAINER_STYLE = { width: "100%", height: "520px" };

export default function MapaVeterinariosAlbergues({
    defaultRadiusKm = 5,
    defaultShowVeterinarios = true,
    defaultShowAlbergues = true,
}) {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: apiKey || "",
        libraries: MAP_LIBRARIES,
    });

  const mapRef = useRef(null);
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [places, setPlaces] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [geoError, setGeoError] = useState(null);
  const [radiusKm, setRadiusKm] = useState(defaultRadiusKm);
  const [filters, setFilters] = useState({
    veterinarios: defaultShowVeterinarios,
    albergues: defaultShowAlbergues,
  });

  const typesToSearch = useMemo(() => {
    const t = [];
    if (filters.veterinarios) t.push("veterinary_care");
    if (filters.albergues) t.push("animal_shelter");
    return t;
  }, [filters]);

  useEffect(() => {
    if (!navigator?.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCenter({ lat: latitude, lng: longitude });
      },
      (err) => {
        setGeoError(err?.message || "No se pudo obtener tu ubicación.");
      },
      { enableHighAccuracy: false, timeout: 8000 }
    );
  }, []);

  // Helper para ejecutar Nearby Search (Places)
  const nearbySearchPromise = (service, request) =>
    new Promise((resolve) => {
      service.nearbySearch(request, (results, status /*, pagination */) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && Array.isArray(results)) {
          resolve(results);
        } else {
          resolve([]);
        }
      });
    });

  const runSearch = async () => {
    if (!isLoaded || !window.google || !mapRef.current || typesToSearch.length === 0) return;
    setLoading(true);
    setSelected(null);

    try {
      const service = new window.google.maps.places.PlacesService(mapRef.current);
      const allResults = [];
      const dedupe = new Map();

      // Ejecuta una búsqueda por cada tipo activo (no se pueden pasar múltiples types a la vez)
      for (const type of typesToSearch) {
        const req = {
          location: center,
          radius: Math.max(200, Math.min(50000, radiusKm * 1000)), // entre 200m y 50km
          type,
        };
        const results = await nearbySearchPromise(service, req);
        for (const r of results) {
          if (!dedupe.has(r.place_id)) {
            dedupe.set(r.place_id, true);
            allResults.push(r);
          }
        }
      }

      // Ordena por distancia aproximada al centro
      allResults.sort((a, b) => {
        const da = distanceInMeters(center, a.geometry?.location);
        const db = distanceInMeters(center, b.geometry?.location);
        return da - db;
      });

      setPlaces(allResults);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Cálculo de distancia aproximada (haversine simple)
  const distanceInMeters = (from, toLoc) => {
    try {
      const to = toLoc?.lat ? { lat: toLoc.lat(), lng: toLoc.lng() } : toLoc;
      if (!from || !to) return Number.POSITIVE_INFINITY;
      const R = 6371000; // m
      const dLat = deg2rad(to.lat - from.lat);
      const dLon = deg2rad(to.lng - from.lng);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(from.lat)) * Math.cos(deg2rad(to.lat)) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    } catch {
      return Number.POSITIVE_INFINITY;
    }
  };

  const deg2rad = (deg) => (deg * Math.PI) / 180;

  const onMapLoad = (map) => {
    mapRef.current = map;
  };

  const onIdle = () => {
    if (!mapRef.current) return;
    const c = mapRef.current.getCenter();
    if (c) setCenter({ lat: c.lat(), lng: c.lng() });
  };

  const recenterToUser = () => {
    if (!navigator?.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const next = { lat: latitude, lng: longitude };
        setCenter(next);
        if (mapRef.current) {
          mapRef.current.panTo(next);
          mapRef.current.setZoom(14);
        }
      },
      () => {},
      { enableHighAccuracy: false, timeout: 8000 }
    );
  };

  const openInGoogleMaps = (placeId) => {
    const url = `https://www.google.com/maps/place/?q=place_id:${placeId}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (loadError) {
    return (
      <div className="p-4 text-red-700 bg-red-50 rounded-xl border border-red-200">
        Error al cargar Google Maps: {String(loadError)}
      </div>
    );
  }

  if (!apiKey) {
    return (
      <div className="p-4 text-[#9f5b53] bg-[#fceae0] rounded-xl border border-[#f3d8cb]">
        <p className="font-semibold">Falta configurar la API Key:</p>
        <p className="text-sm mt-1">Agrega NEXT_PUBLIC_GOOGLE_MAPS_API_KEY en tu <code>.env.local</code> y recarga.</p>
      </div>
    );
  }

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
      {/* Columna Mapa */}
      <div className="rounded-2xl overflow-hidden border border-black/5 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-[#fff6f1] to-[#fdeee7] border-b">
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#6b7076]">Radio:</span>
            <input
              type="range"
              min={1}
              max={10}
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="w-40"
            />
            <span className="text-sm text-[#2b3136] font-medium">{radiusKm} km</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={filters.veterinarios}
                onChange={(e) => setFilters((f) => ({ ...f, veterinarios: e.target.checked }))}
              />
              Veterinarios
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={filters.albergues}
                onChange={(e) => setFilters((f) => ({ ...f, albergues: e.target.checked }))}
              />
              Albergues
            </label>
            <button
              onClick={recenterToUser}
              className="ml-2 px-3 py-1.5 rounded-lg text-white bg-[#7d9a75] hover:bg-[#607859]"
              type="button"
            >
              Mi ubicación
            </button>
            <button
              onClick={runSearch}
              className="px-3 py-1.5 rounded-lg text-white bg-[#d3764c] hover:bg-[#c1663e]"
              type="button"
              disabled={loading || typesToSearch.length === 0}
            >
              {loading ? "Buscando…" : "Buscar"}
            </button>
          </div>
        </div>

        {geoError && (
          <div className="px-4 py-2 text-xs text-[#9f5b53] bg-[#fceae0] border-t">{geoError}</div>
        )}

        {isLoaded && (
          <GoogleMap
            onLoad={onMapLoad}
            onIdle={onIdle}
            mapContainerStyle={CONTAINER_STYLE}
            center={center}
            zoom={14}
            options={{
              mapTypeControl: false,
              streetViewControl: false,
              fullscreenControl: false,
            }}
          >
            {/* Centro del usuario */}
            <Marker position={center} title="Tú" />

            {/* Resultados */}
            {places.map((p) => (
              <Marker
                key={p.place_id}
                position={{
                  lat: p.geometry?.location?.lat(),
                  lng: p.geometry?.location?.lng(),
                }}
                onClick={() => setSelected(p)}
              />
            ))}

            {selected && (
              <InfoWindow
                position={{
                  lat: selected.geometry?.location?.lat(),
                  lng: selected.geometry?.location?.lng(),
                }}
                onCloseClick={() => setSelected(null)}
              >
                <div className="text-sm">
                  <div className="font-semibold text-[#2b3136]">{selected.name}</div>
                  {selected.rating != null && (
                    <div className="text-xs text-[#6b7076]">⭐ {selected.rating} ({selected.user_ratings_total || 0})</div>
                  )}
                  {selected.vicinity && (
                    <div className="text-xs text-[#6b7076] mt-1">{selected.vicinity}</div>
                  )}
                  <button
                    onClick={() => openInGoogleMaps(selected.place_id)}
                    className="mt-2 px-3 py-1.5 rounded-lg text-white bg-[#7d9a75] hover:bg-[#607859]"
                  >
                    Abrir en Google Maps
                  </button>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        )}
      </div>

      {/* Columna Lista */}
      <aside className="rounded-2xl border border-black/5 bg-white p-3 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-semibold text-[#607859]">Resultados cercanos</h3>
          <span className="text-xs text-[#6b7076]">{places.length} encontrados</span>
        </div>

        <div className="space-y-2 max-h-[480px] overflow-auto pr-1">
          {places.length === 0 && (
            <div className="text-sm text-[#6b7076]">No hay resultados. Ajusta filtros o presiona <b>Buscar</b>.</div>
          )}

          {places.map((p) => (
            <div
              key={p.place_id}
              className="p-3 border rounded-xl hover:shadow-sm cursor-pointer"
              onClick={() => {
                setSelected(p);
                if (mapRef.current && p.geometry?.location) {
                  mapRef.current.panTo({
                    lat: p.geometry.location.lat(),
                    lng: p.geometry.location.lng(),
                  });
                }
              }}
            >
              <div className="text-sm font-medium text-[#2b3136]">{p.name}</div>
              <div className="text-xs text-[#6b7076]">{p.vicinity || "Sin dirección"}</div>
              <div className="text-xs text-[#6b7076] flex items-center gap-2 mt-1">
                {p.rating != null && <span>⭐ {p.rating}</span>}
                {typeof p.user_ratings_total === "number" && <span>({p.user_ratings_total})</span>}
              </div>
              <div className="mt-2 flex gap-2">
                <button
                  className="px-3 py-1.5 rounded-lg text-white bg-[#7d9a75] hover:bg-[#607859] text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelected(p);
                  }}
                >
                  Ver en el mapa
                </button>
                <button
                  className="px-3 py-1.5 rounded-lg text-white bg-[#d3764c] hover:bg-[#c1663e] text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    openInGoogleMaps(p.place_id);
                  }}
                >
                  Abrir en Google Maps
                </button>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
