const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
const getToken = () => (typeof window !== "undefined" ? localStorage.getItem("token") : null);

export async function apiFetch(path, { method = "GET", json, formData } = {}) {
    const headers = {};
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    let body;
    if (json) { headers["Content-Type"] = "application/json"; body = JSON.stringify(json); }
    if (formData) { body = formData; }
    const res = await fetch(`${API_BASE}${path}`, { method, headers, body });
    const text = await res.text();
    let data; try { data = text ? JSON.parse(text) : null; } catch { data = text; }
    return { ok: res.ok, status: res.status, data, API_BASE };
}