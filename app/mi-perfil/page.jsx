// app/.../perfil/page.jsx
"use client";
import { useRef, useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import PerfilView from "@/components/PerfilView";
import { apiFetch } from "@/lib/apiClient";
import VeterinarioHeader from "@/components/VeterinarioHeader";
import AdoptanteHeader from "@/components/AdoptanteHeader";

export default function PerfilPage() {
  const { perfil, loading, mensaje, setMensaje, saving, uploading, saveProfile, saveAvatar } = useProfile();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ username: "", ciudad: "", telefono: "" });

  const fileInputRef = useRef(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  if (loading) return <p className="p-6">Cargando perfil...</p>;
  if (!perfil) return <p className="p-6">No hay perfil</p>;

  // sync form cuando cargue perfil (simplo)
  if (!formData.username && perfil?.username) {
    setFormData({ username: perfil.username, ciudad: perfil.ciudad || "", telefono: perfil.telefono || "" });
  }

  const onChange = (e) => setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  const onSubmit = async (e) => { e.preventDefault(); await saveProfile(formData); setEditMode(false); };

  const onOpenFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) return setMensaje("Selecciona una imagen válida");
    if (f.size > 5 * 1024 * 1024) return setMensaje("La imagen es muy grande (máx 5MB)");
    setMensaje("");
    setAvatarFile(f);
    setAvatarPreview(URL.createObjectURL(f));
  };
  const onUploadAvatar = async () => {
    if (!avatarFile) return;
    await saveAvatar(avatarFile);
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(null); setAvatarFile(null);
  };
  const onCancelAvatar = () => { if (avatarPreview) URL.revokeObjectURL(avatarPreview); setAvatarPreview(null); setAvatarFile(null); };

  const resolveAvatarSrc = (p) => {
    const src = p?.foto_perfil;
    if (!src) return "https://petmatch-imagenes.s3.us-east-2.amazonaws.com/fotos-perfil/perfil_defualt.jpg";
    if (src.startsWith("http")) return src;
    const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
    return `${base}${src}`;
  };

  const buildInfoCards = (p) => {
    const base = [
      { color: "salmon", value: p?.email ?? "-", label: "Email" },
      { color: "green", value: p?.ciudad || "-", label: "Ciudad" },
      { color: "salmon", value: p?.telefono || "-", label: "Teléfono" },
    ];
    if (p?.tipo_usuario === "adoptante") base.push({ color:"green", value:p?.mascotas_adoptadas ?? 0, label:"Mascotas adoptadas" });
    else if (p?.tipo_usuario === "veterinario") base.push({ color:"green", value:p?.mascotas_publicadas ?? 0, label:"Mascotas publicadas" });
    return base;
  };

  return (
    <div>
      {perfil.tipo_usuario === "adoptante" ? <AdoptanteHeader/> : <VeterinarioHeader/>}
      <div className="min-h-screen bg-gradient-to-b from-[#fff6f1] to-[#fdeee7]">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <PerfilView
          perfil={perfil}
          mensaje={mensaje}
          onEdit={(v = true) => setEditMode(v)}
          onOpenFile={onOpenFile}
          onUploadAvatar={onUploadAvatar}
          onCancelAvatar={onCancelAvatar}
          avatarPreview={avatarPreview}
          fileInputRef={fileInputRef}
          resolveAvatarSrc={resolveAvatarSrc}
          editMode={editMode}
          formData={formData}
          onChange={onChange}
          onSubmit={onSubmit}
          saving={saving}
          uploading={uploading}
          buildInfoCards={buildInfoCards}
        />
      </div>
    </div>
    </div>
  );
}
