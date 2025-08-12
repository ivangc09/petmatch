import { apiFetch } from "@/lib/apiClient";

export const getProfile   = () => apiFetch("/api/auth/mi-perfil/");
export const updateProfile = (payload) => apiFetch("/api/auth/mi-perfil/", { method:"PATCH", json: payload });
export const uploadAvatar  = (file) => {
    const fd = new FormData();
    fd.append("foto_perfil", file);
    return apiFetch("/api/auth/mi-perfil/", { method:"PATCH", formData: fd });
};