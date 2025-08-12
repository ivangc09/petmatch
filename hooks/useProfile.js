import { useEffect, useState } from "react";
import { getProfile, updateProfile, uploadAvatar } from "@/services/profile";

export function useProfile() {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    (async () => {
      const { ok, data } = await getProfile();
      if (ok) setPerfil(data); else setMensaje("No se pudo cargar el perfil");
      setLoading(false);
    })();
  }, []);

  const saveProfile = async (payload) => {
    setSaving(true); setMensaje("");
    const { ok, data } = await updateProfile(payload);
    if (ok) { setPerfil(data); setMensaje("✅ Perfil actualizado"); } else { setMensaje("Error al actualizar"); }
    setSaving(false);
    return ok;
  };

  const saveAvatar = async (file) => {
    setUploading(true); setMensaje("");
    const { ok, data } = await uploadAvatar(file);
    if (ok) { setPerfil(data); setMensaje("✅ Foto actualizada"); } else { setMensaje("❌ Error al subir imagen"); }
    setUploading(false);
    return ok;
  };

  return { perfil, loading, saving, uploading, mensaje, setMensaje, saveProfile, saveAvatar };
}