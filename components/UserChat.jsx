"use client";

import { useEffect, useRef, useState } from "react";
import ListaConversacion from "./ListaConversacion";
import ListaMensajes from "./ListaMensajes";
import InputMensaje from "./InputMensaje";
import useDMWebSocket from "@/hooks/useDMWebSocket";

const API_BASE =
  (typeof window !== "undefined" && process.env.NEXT_PUBLIC_API_BASE) ||
  "http://localhost:8000";

function makeClientId() {
  return `c_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Intenta obtener peerId desde prop, URL (?peer=) o localStorage */
function resolveInitialPeerId(initialPeerIdProp) {
  if (initialPeerIdProp != null && !Number.isNaN(Number(initialPeerIdProp))) {
    return Number(initialPeerIdProp);
  }
  try {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const pid = sp.get("peer");
      if (pid != null && !Number.isNaN(Number(pid))) return Number(pid);
    }
  } catch {}
  try {
    if (typeof window !== "undefined") {
      const cached = window.localStorage.getItem("chat:lastPeerId");
      if (cached != null && !Number.isNaN(Number(cached))) return Number(cached);
    }
  } catch {}
  return null;
}

export default function UserChat({
  currentUserId,
  token,
  initialPeerId,
}) {
  const me = currentUserId != null ? Number(currentUserId) : null;

  const [selected, setSelected] = useState(null); // { peerId, conversationId?, peer? }
  const peerId = selected?.peerId ?? null;
  const conversationId = selected?.conversationId ?? null;

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [convRefreshTick, setConvRefreshTick] = useState(0);
  const [pollingActive, setPollingActive] = useState(false);

  const processedRef = useRef(new Set());        // "id:XX" | "cid:YY"
  const lastIdsRef = useRef(new Set());          // ids vistos
  const lastClientIdsRef = useRef(new Set());    // client_ids vistos
  const mountedRef = useRef(true);
  const bootedRef = useRef(false);

  // ⏳ Espera de ACK por client_id cuando se envía por WS
  const pendingAckRef = useRef(new Map()); // client_id -> timeoutId

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // Bootstrap: fija peerId al montar (prop / URL / localStorage)
  useEffect(() => {
    if (bootedRef.current) return;
    const pid = resolveInitialPeerId(initialPeerId);
    if (pid) {
      setSelected({ peerId: pid, conversationId: null, peer: null });
      try { window.localStorage.setItem("chat:lastPeerId", String(pid)); } catch {}
    }
    bootedRef.current = true;
  }, [initialPeerId]);

  const isMine = (sid) => me != null && sid != null && Number(sid) === me;

  // Normaliza a { id, client_id, sender_id, text, created_at, mine }
  const normalizeMsg = (raw) => {
    if (!raw) return null;
    const sid =
      raw?.sender_id != null ? Number(raw.sender_id)
      : raw?.sender?.id != null ? Number(raw.sender.id)
      : null;
    return {
      id: raw.id ?? null,
      client_id: raw.client_id ?? null,
      sender_id: sid,
      text: (raw.text ?? raw.content ?? "") + "",
      created_at: raw.created_at ?? raw.timestamp ?? null,
      mine: isMine(sid),
    };
  };

  // Heurística para dedupe de “doble creación” (WS+POST con segundos de diferencia)
  const isLikelyDuplicateMine = (a, b) => {
    try {
      if (!a || !b) return false;
      if (!a.text || !b.text) return false;
      if (!(a.created_at && b.created_at)) return false;
      if (!(a.mine && b.mine)) return false;
      if (a.text !== b.text) return false;
      const dt = Math.abs(new Date(a.created_at) - new Date(b.created_at));
      return dt < 3000; // 3s
    } catch { return false; }
  };

  // WS: sólo aceptamos mensajes del peer actual (entrantes o salientes)
  const onWsMessage = (msg) => {
    const normalized = normalizeMsg(msg);
    if (!normalized) return;

    const rec = msg?.recipient != null ? Number(msg.recipient) : null;
    const isForThisPeer =
      Number(normalized.sender_id) === Number(peerId) ||
      (rec != null && Number(rec) === Number(peerId));
    if (!isForThisPeer) return;

    // ACK de mis propios mensajes → reemplazar optimista
    if (normalized.client_id && normalized.mine) {
      const pending = pendingAckRef.current.get(normalized.client_id);
      if (pending) {
        clearTimeout(pending);
        pendingAckRef.current.delete(normalized.client_id);
      }
    }

    // Si ya vi este client_id (optimista) y viene el definitivo con id → reemplazo
    if (normalized.client_id && lastClientIdsRef.current.has(normalized.client_id)) {
      setHistory((prev) => {
        const next = [...prev];
        const i = next.findIndex(x => x.client_id === normalized.client_id && (x.id == null));
        if (i >= 0) {
          next[i] = normalized;
          if (normalized.id) {
            lastIdsRef.current.add(normalized.id);
            processedRef.current.add(`id:${normalized.id}`);
          }
          return next;
        }
        // Si no encuentro optimista, continuar flujo normal (igual lo añadimos abajo si no duplica)
        return next;
      });
      // Evita continuar si ya hicimos el reemplazo
      if (normalized.id && processedRef.current.has(`id:${normalized.id}`)) return;
    }

    // Evitar duplicados por id/cid ya procesados
    const sidKey = normalized.id ? `id:${normalized.id}` : null;
    const cidKey = normalized.client_id ? `cid:${normalized.client_id}` : null;
    if (sidKey && processedRef.current.has(sidKey)) return;
    if (cidKey && processedRef.current.has(cidKey)) return;

    // Heurística: si ya hay un “mío” igual en ventana de 3s, ignora
    if (normalized.mine) {
      const dupMine = history.some(h => isLikelyDuplicateMine(h, normalized));
      if (dupMine) return;
    }

    // Marcar vistos
    if (normalized.id) {
      lastIdsRef.current.add(normalized.id);
      processedRef.current.add(`id:${normalized.id}`);
    }
    if (normalized.client_id) {
      lastClientIdsRef.current.add(normalized.client_id);
      processedRef.current.add(`cid:${normalized.client_id}`);
    }

    // Agregar al historial
    setHistory((prev) => [...prev, normalized]);
  };

  // ⬅️ Conéctate al canal del PEER (tu backend lo espera así)
  const { ready, sendPayload, resetLive } = useDMWebSocket({
    token,
    peerId,
    onMessage: onWsMessage,
  });

  const live = ready || pollingActive;

  async function fetchMessagesJSON(opts) {
    const base = API_BASE.replace(/\/+$/, "");
    const url = `${base}/api/chat/messages/?peer_id=${peerId}`;
    const res = await fetch(url, opts);
    const ctype = res.headers.get("content-type") || "";
    if (!res.ok || !ctype.includes("application/json")) {
      const body = await res.text();
      throw new Error(`GET ${url} -> ${res.status} ${ctype} ${body.slice(0,160)}`);
    }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  }

  // Carga de historial + polling visible cada 3s
  useEffect(() => {
    if (!token || !peerId) return;

    let ignore = false;
    const controller = new AbortController();
    let intervalId = null;

    const run = async () => {
      setLoading(true);
      try {
        const data = await fetchMessagesJSON({
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });
        if (!ignore && mountedRef.current) {
          const normalized = data.map(normalizeMsg).filter(Boolean);
          setHistory(normalized);

          // seed sets para evitar duplicados
          try {
            normalized.forEach((m) => {
              if (m?.id != null) { lastIdsRef.current.add(m.id); processedRef.current.add(`id:${m.id}`); }
              if (m?.client_id != null) { lastClientIdsRef.current.add(m.client_id); processedRef.current.add(`cid:${m.client_id}`); }
            });
          } catch {}
        }
      } catch {
        if (!ignore) setHistory([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    const canPoll = () =>
      typeof document === "undefined" || document.visibilityState === "visible";

    // reset antes de cargar
    processedRef.current.clear();
    lastIdsRef.current = new Set();
    lastClientIdsRef.current = new Set();
    pendingAckRef.current.forEach((t) => clearTimeout(t));
    pendingAckRef.current.clear();

    setHistory([]);
    resetLive();

    run();

    // Polling cada 3s cuando la pestaña esté visible
    setPollingActive(true);
    intervalId = setInterval(async () => {
      if (!canPoll()) return;

      try {
        const base = API_BASE.replace(/\/+$/, "");
        const res = await fetch(`${base}/api/chat/messages/?peer_id=${peerId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const ctype = res.headers.get("content-type") || "";
        if (!res.ok || !ctype.includes("application/json")) return;
        const data = await res.json();
        if (!Array.isArray(data)) return;

        // Normalizamos entrantes
        const incoming = data.map(normalizeMsg).filter(Boolean);

        // Reconciliar contra el historial actual
        setHistory((prev) => {
          if (!prev?.length && !incoming?.length) return prev;

          const next = [...prev];

          for (const m of incoming) {
            const idSeen = m.id && lastIdsRef.current.has(m.id);
            if (idSeen) continue;

            // 1) Si trae client_id y hay un optimista sin id => REEMPLAZAR
            if (m.client_id) {
              const idxOpt = next.findIndex(
                (x) => x.client_id === m.client_id && (x.id == null)
              );
              if (idxOpt >= 0) {
                next[idxOpt] = m;
                lastClientIdsRef.current.add(m.client_id);
                processedRef.current.add(`cid:${m.client_id}`);
                if (m.id) {
                  lastIdsRef.current.add(m.id);
                  processedRef.current.add(`id:${m.id}`);
                }
                continue;
              }
            }

            // 2) Heurística por texto + timestamp cercano (por si el server no devuelve client_id)
            const idxHeur = next.findIndex(
              (x) =>
                x.id == null &&
                !!x.client_id &&
                x.text === m.text &&
                Math.abs(new Date(x.created_at) - new Date(m.created_at)) < 3000
            );
            if (idxHeur >= 0) {
              next[idxHeur] = { ...m, client_id: next[idxHeur].client_id };
              if (m.client_id) {
                lastClientIdsRef.current.add(m.client_id);
                processedRef.current.add(`cid:${m.client_id}`);
              }
              if (m.id) {
                lastIdsRef.current.add(m.id);
                processedRef.current.add(`id:${m.id}`);
              }
              continue;
            }

            // 3) Heurística extra: si parece duplicado mío, saltar
            if (m.mine && next.some(x => isLikelyDuplicateMine(x, m))) {
              if (m.id) {
                lastIdsRef.current.add(m.id);
                processedRef.current.add(`id:${m.id}`);
              }
              continue;
            }

            // 4) Si no hay duplicado, agregar como nuevo
            const dupById = m.id && next.some((x) => x.id === m.id);
            const dupByCid = m.client_id && next.some((x) => x.client_id === m.client_id);
            if (!dupById && !dupByCid) {
              next.push(m);
              if (m.id) {
                lastIdsRef.current.add(m.id);
                processedRef.current.add(`id:${m.id}`);
              }
              if (m.client_id) {
                lastClientIdsRef.current.add(m.client_id);
                processedRef.current.add(`cid:${m.client_id}`);
              }
            }
          }

          return next;
        });
      } catch {}
    }, 3000);

    return () => {
      ignore = true;
      controller.abort();
      if (intervalId) clearInterval(intervalId);
      setPollingActive(false);
      pendingAckRef.current.forEach((t) => clearTimeout(t));
      pendingAckRef.current.clear();
    };
  }, [token, peerId, conversationId, resetLive]);

  const handleSend = async (text) => {
    if (!text?.trim() || !peerId || currentUserId == null) return;

    const clientId = makeClientId();

    // Optimista
    const tempMsg = {
      id: null,
      client_id: clientId,
      sender_id: me,
      text,
      created_at: new Date().toISOString(),
      mine: true,
    };
    setHistory((h) => [...h, tempMsg]);

    processedRef.current.add(`cid:${clientId}`);
    lastClientIdsRef.current.add(clientId);

    const base = API_BASE.replace(/\/+$/, "");

    // Preferir **SOLO WS** si está listo; si no llega ACK, fallback a POST
    if (ready) {
      try {
        sendPayload({ action: "send", text, client_id: clientId });
        // Espera ACK del WS; si no llega, fallback
        const t = setTimeout(async () => {
          // aún no llegó ACK => fallback a POST
          try {
            const res = await fetch(`${base}/api/chat/messages/`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ peer_id: peerId, text, client_id: clientId }),
            });
            const ctype = res.headers.get("content-type") || "";
            if (ctype.includes("application/json")) {
              const msg = await res.json();
              const normalized = normalizeMsg({ ...msg, client_id: clientId });
              if (normalized?.id) {
                processedRef.current.add(`id:${normalized.id}`);
                lastIdsRef.current.add(normalized.id);
              }
              setHistory((prev) => {
                const next = [...prev];
                const i = next.findIndex((m) => m.client_id === clientId && (m.id == null));
                if (i >= 0) next[i] = normalized;
                else next.push(normalized);
                return next;
              });
              setConvRefreshTick((n) => n + 1);
            }
          } catch {}
          pendingAckRef.current.delete(clientId);
        }, 2500);
        pendingAckRef.current.set(clientId, t);
      } catch {
        // Si WS falla al enviar, hacemos POST
        try {
          const res = await fetch(`${base}/api/chat/messages/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ peer_id: peerId, text, client_id: clientId }),
          });
          const ctype = res.headers.get("content-type") || "";
          if (ctype.includes("application/json")) {
            const msg = await res.json();
            const normalized = normalizeMsg({ ...msg, client_id: clientId });
            if (normalized?.id) {
              processedRef.current.add(`id:${normalized.id}`);
              lastIdsRef.current.add(normalized.id);
            }
            setHistory((prev) => {
              const next = [...prev];
              const i = next.findIndex((m) => m.client_id === clientId && (m.id == null));
              if (i >= 0) next[i] = normalized;
              else next.push(normalized);
              return next;
            });
            setConvRefreshTick((n) => n + 1);
          }
        } catch {}
      }
    } else {
      // WS no listo → POST directo
      try {
        const res = await fetch(`${base}/api/chat/messages/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ peer_id: peerId, text, client_id: clientId }),
        });
        const ctype = res.headers.get("content-type") || "";
        if (ctype.includes("application/json")) {
          const msg = await res.json();
          const normalized = normalizeMsg({ ...msg, client_id: clientId });
          if (normalized?.id) {
            processedRef.current.add(`id:${normalized.id}`);
            lastIdsRef.current.add(normalized.id);
          }
          setHistory((prev) => {
            const next = [...prev];
            const i = next.findIndex((m) => m.client_id === clientId && (m.id == null));
            if (i >= 0) next[i] = normalized;
            else next.push(normalized);
            return next;
          });
          setConvRefreshTick((n) => n + 1);
        }
      } catch {}
    }
  };

  return (
    <div className="w-full h-[540px] md:h-[580px] flex rounded-2xl overflow-hidden border border-[#f3d7cb]/60 shadow bg-gradient-to-b from-[#fff6f1] to-[#fdeee7]">
      <ListaConversacion
        token={token}
        activePeerId={peerId}
        refreshKey={convRefreshTick}
        onSelectPeer={(val) => {
          let pid = null, cid = null, peer = null;
          if (typeof val === "object" && val !== null) {
            pid = val.peerId ?? val.id ?? null;
            cid = val.conversationId ?? null;
            peer = val.peer ?? null;
          } else {
            pid = val ?? null;
          }
          if (pid) {
            setSelected({ peerId: pid, conversationId: cid, peer });
            try { window.localStorage.setItem("chat:lastPeerId", String(pid)); } catch {}
          }
        }}
      />
      <section className="flex-1 flex flex-col">
        {peerId ? (
          <>
            <div className="px-4 py-3 border-b border-[#f3d7cb]/60 bg-white/70 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-[#7d9a75]/20 ring-1 ring-[#7d9a75]/30" />
                <div className="font-semibold text-gray-800">
                  Conversación con Usuario #{peerId}
                </div>
              </div>
              <div className="text-xs text-gray-600 flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${ (ready || pollingActive) ? "bg-[#7d9a75]" : "bg-amber-500"}`} />
                {(ready || pollingActive) ? "En vivo" : "Conectando…"}
              </div>
            </div>

            <div className="flex-1 min-h-0">
              <ListaMensajes messages={history} currentUserId={currentUserId} loading={loading} />
            </div>

            <InputMensaje onSend={handleSend} disabled={!peerId || !token} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-600">
            Selecciona una conversación para empezar a chatear.
          </div>
        )}
      </section>
    </div>
  );
}
