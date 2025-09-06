import { useEffect, useState } from "react";
import { getProfile, updateProfile, uploadAvatar } from "@/services/profile";
import { useToast } from "@/components/FeedBack";

export function useProfile() {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const { show } = useToast();

  useEffect(() => {
    (async () => {
      const { ok, data } = await getProfile();
      if (ok) setPerfil(data); else setMensaje(show({ title: "Error", message: "No se pudo cargar el perfil", variant: "danger" }));
      setLoading(false);
    })();
  }, []);

  const saveProfile = async (payload) => {
    setSaving(true); setMensaje("");
    const { ok, data } = await updateProfile(payload);
    if (ok) { setPerfil(data); setMensaje(show({ title: "Exito", message: "Perfil actualizado", variant: "success" })); } else { setMensaje(show({ title: "Error", message: "No se pudo actualizar el perfil", variant: "danger" })); }
    setSaving(false);
    return ok;
  };

  const saveAvatar = async (file) => {
    setUploading(true); setMensaje("");
    const { ok, data } = await uploadAvatar(file);
    if (ok) { setPerfil(data); setMensaje(show({ title: "Exito", message: "Foto actualizada", variant: "success" })); } else { setMensaje(show({ title: "Error", message: "Error al subir la imagen", variant: "danger" })); }
    setUploading(false);
    return ok;
  };

  return { perfil, loading, saving, uploading, mensaje, setMensaje, saveProfile, saveAvatar };
}