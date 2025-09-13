"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export default function useSolicitudes({ defaultPageSize = 10 } = {}) {
    const [items, setItems] = useState([]);
    const [count, setCount] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(defaultPageSize);
    const [search, setSearch] = useState("");
    const [petId, setPetId] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const token = useMemo(() => (typeof window !== "undefined" ? localStorage.getItem("token") : null), []);
    const baseUrl = useMemo(
        () => process.env.NEXT_PUBLIC_API_BASE || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
        []
    );

    const endpoint = `${baseUrl}/api/mascotas/solicitudes/mis-solicitudes/`;
    const abortRef = useRef(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        if (abortRef.current) abortRef.current.abort();
        abortRef.current = new AbortController();

        const qs = new URLSearchParams();
        if (search.trim()) qs.set("search", search.trim());
        if (petId.trim()) qs.set("pet_id", petId.trim());
        if (page > 1) qs.set("page", String(page));
        if (pageSize) qs.set("page_size", String(pageSize));

        try {
            const res = await fetch(`${endpoint}?${qs.toString()}`, {
                signal: abortRef.current.signal,
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            });
            const json = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(json?.detail || `HTTP ${res.status}`);

            setItems(Array.isArray(json?.results) ? json.results : []);
            setCount(Number.isFinite(json?.count) ? json.count : (json?.results?.length || 0));
        } catch (e) {
            if (e?.name !== "AbortError") setError(e?.message || "Error al cargar");
        } finally {
            setLoading(false);
        }
    }, [endpoint, token, search, petId, page, pageSize]);

    useEffect(() => { fetchData(); }, [fetchData]);

  // Helpers
    function formatDate(dt) {
        if (!dt) return "—";
        const d = new Date(dt);
        return Number.isNaN(d.getTime()) ? String(dt) : d.toLocaleString("es-MX");
    }
    function boolStr(v) {
        if (v === true) return "Sí";
        if (v === false) return "No";
        return "—";
    }

    return {
        // data
        items, count, loading, error,
        // filtros/paginación
        page, setPage, pageSize, setPageSize,
        search, setSearch, petId, setPetId,
        // io
        fetchData,
        // auth/base
        token, baseUrl,
        // utils
        formatDate, boolStr,
        totalPages: Math.max(1, Math.ceil((count || 0) / (pageSize || 1))),
    };
}
