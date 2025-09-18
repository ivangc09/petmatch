import { useEffect, useState, useCallback } from "react";
import { getProfile, updateProfile, uploadAvatar, getPetsCount } from "@/services/profile";
import { useToast } from "@/components/FeedBack";

export function useProfile() {
    const [perfil, setPerfil] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [petsCount, setPetsCount] = useState(0);
    const [loadingPetsCount, setLoadingPetsCount] = useState(false);

    const [mensaje, setMensaje] = useState("");
    const { show } = useToast();

    const normalizeCount = (data) => {
        if (typeof data === "number") return data;
        if (data && typeof data === "object") {
            if (typeof data.count === "number") return data.count;
            if (typeof data.total === "number") return data.total;
            if (typeof data.total_registradas === "number") return data.total_registradas;
        }
        return 0;
    };

    const fetchPetsCount = useCallback(async () => {
    setLoadingPetsCount(true);
    const pc = await getPetsCount();
    if (pc?.ok) {
      setPetsCount(normalizeCount(pc.data));
    } else {
      show({ title: "Aviso", message: "No se pudo obtener el conteo de mascotas", variant: "warning" });
    }
    setLoadingPetsCount(false);
  }, [show]);

  useEffect(() => {
    (async () => {
      try {
        const [pf, pc] = await Promise.all([getProfile(), getPetsCount()]);
        if (pf?.ok) {
          setPerfil(pf.data);
        } else {
          show({ title: "Error", message: "No se pudo cargar el perfil", variant: "danger" });
        }

        if (pc?.ok) {
          setPetsCount(normalizeCount(pc.data));
        } else {
          show({ title: "Aviso", message: "No se pudo obtener el conteo de mascotas", variant: "warning" });
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [show]);

  const saveProfile = async (payload) => {
    setSaving(true);
    setMensaje("");
    const { ok, data } = await updateProfile(payload);
    if (ok) {
      setPerfil(data);
      setMensaje(show({ title: "Éxito", message: "Perfil actualizado", variant: "success" }));
    } else {
      setMensaje(show({ title: "Error", message: "No se pudo actualizar el perfil", variant: "danger" }));
    }
    setSaving(false);
    return ok;
  };

  const saveAvatar = async (file) => {
    setUploading(true);
    setMensaje("");
    const { ok, data } = await uploadAvatar(file);
    if (ok) {
      setPerfil(data);
      setMensaje(show({ title: "Éxito", message: "Foto actualizada", variant: "success" }));
    } else {
      setMensaje(show({ title: "Error", message: "Error al subir la imagen", variant: "danger" }));
    }
    setUploading(false);
    return ok;
  };

  const refreshPetsCount = fetchPetsCount;

  return {
    perfil,
    loading,
    saving,
    uploading,
    mensaje,
    setMensaje,
    saveProfile,
    saveAvatar,
    petsCount,
    loadingPetsCount,
    refreshPetsCount,
  };
}
