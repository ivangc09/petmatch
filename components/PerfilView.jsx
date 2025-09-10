// PerfilView.jsx
"use client";

import {
  Camera, Upload, X, Edit3,
  Mail, MapPin, Phone, PawPrint
} from "lucide-react";
import Link from "next/link";

export default function PerfilView({
  perfil, mensaje,
  onEdit, onOpenFile, onUploadAvatar, onCancelAvatar,
  avatarPreview, fileInputRef, resolveAvatarSrc,
  editMode, formData, onChange, onSubmit, saving, uploading, buildInfoCards
}) {
  const roleLabel = perfil?.tipo_usuario === "veterinario" ? "Veterinario" : "Adoptante";
  const roleColor = perfil?.tipo_usuario === "veterinario" ? "bg-[#e8f5ef] text-[#3b7c69] border-[#bfe2d6]" : "bg-[#fff1ec] text-[#bf7046] border-[#f4cbbd]";

  return (
    <div>
        <header className="mb-6 flex justify-between"> 
            <nav className="text-sm text-[#6b7076]">
                <Link href="/dashboard" className="hover:underline">Panel</Link>
                <span className="mx-2">/</span>
                <span className="mx-2 font-medium">Mi Perfil</span>
            </nav>

            <Link href="/dashboard" className="rounded-xl px-4 py-2 bg-[#fceae0] text-[#9f5b53] hover:bg-[#f8dfd2]">
              ← Volver
            </Link>
      </header>
    <div className="rounded-3xl overflow-hidden border border-black/5 shadow-[0_12px_40px_rgba(0,0,0,0.08)] bg-white">
      {/* Banner */}
      <div className="h-28 w-full bg-gradient-to-r from-[#fff6f1] to-[#fdeee7]" />

      {/* Header: Avatar + Título */}
      <div className="px-6 md:px-10 -mt-16 relative">
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end">
          {/* Avatar con overlay */}
          <div className="relative shrink-0">
            <img
              src={avatarPreview || resolveAvatarSrc(perfil)}
              alt="Foto de perfil"
              className="w-32 h-32 sm:w-36 sm:h-36 rounded-full object-cover ring-4 ring-white shadow-lg"
            />
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onOpenFile} />

            {!avatarPreview ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border border-black/5 shadow hover:bg-gray-50 text-sm"
              >
                <Camera size={16} /> Cambiar
              </button>
            ) : (
              <div className="absolute -bottom-3 -right-3 flex gap-2">
                <button
                  onClick={onUploadAvatar}
                  disabled={uploading}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#7d9a75] text-white hover:bg-[#607859] disabled:opacity-60 text-sm"
                >
                  <Upload size={16} /> {uploading ? "Subiendo..." : "Guardar"}
                </button>
                <button
                  onClick={onCancelAvatar}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border border-gray-300 hover:bg-gray-50 text-sm"
                >
                  <X size={16} /> Cancelar
                </button>
              </div>
            )}
          </div>

          {/* Títulos + badge */}
          <div className="flex-1 pt-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 font-[Inter]">
                Bienvenido de vuelta,<span className="font-[Dancing_Script] text-[#df7a5e] text-4xl md:text-5xl"> {perfil?.username}</span>
              </h1>
              <span className={`inline-flex items-center px-3 py-1 rounded-full border ${roleColor} text-sm font-medium`}>
                {roleLabel}
              </span>
            </div>
            <p className="mt-3 font-[Inter] text-gray-600 text-base md:text-lg max-w-3xl">
              Detrás de cada mascota feliz hay una persona como tú, lista para dar amor. Gracias por hacer que más colitas se muevan 🐾
            </p>
          </div>

          {/* Botón editar (desktop) */}
          <div className="hidden sm:block pb-1">
            <button
              onClick={onEdit}
              className="inline-flex items-center gap-2 bg-[#7d9a75] text-white px-5 py-2.5 rounded-xl hover:bg-[#607859] transition-colors"
            >
              <Edit3 size={18} /> Editar perfil
            </button>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="px-6 md:px-10 pb-8 pt-6">
        {mensaje && (
          <div className="mb-4 text-sm rounded-xl px-3 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200">
            {mensaje}
          </div>
        )}

        {/* Tarjetas de info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {buildInfoCards(perfil).map((c, i) => (
            <InfoCard key={i} color={c.color} value={c.value} label={c.label} />
          ))}
        </div>

        {/* Botón editar (mobile) */}
        <div className="sm:hidden mt-6">
          <button
            onClick={onEdit}
            className="w-full inline-flex items-center justify-center gap-2 bg-[#7d9a75] text-white px-5 py-3 rounded-xl hover:bg-[#607859] transition-colors"
          >
            <Edit3 size={18} /> Editar perfil
          </button>
        </div>
      </div>

      {/* Modal de edición */}
      {editMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => !saving && onEdit(false)} />
          <form
            onSubmit={onSubmit}
            className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-black/5"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Editar información</h2>
              <button
                type="button"
                onClick={() => !saving && onEdit(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
                aria-label="Cerrar"
                disabled={saving}
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <Field label="Nombre de usuario" name="username" value={formData.username} onChange={onChange} placeholder="Tu nombre de usuario" />
              <Field label="Ciudad" name="ciudad" value={formData.ciudad} onChange={onChange} placeholder="Ej. Guadalajara, MX" />
              <Field label="Teléfono" name="telefono" value={formData.telefono} onChange={onChange} placeholder="Ej. 33-1234-5678" />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => !saving && onEdit(false)}
                className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50"
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#7d9a75] text-white hover:bg-[#607859] disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={saving}
              >
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
    </div>
  );
}

/* --- Subcomponentes --- */

function InfoCard({ color = "green", value = "-", label = "" }) {
  const palettes = {
    salmon: { bg: "bg-[#fef6f3]", text: "text-[#bf7046]", ring: "ring-[#f6d5c7]" },
    green:  { bg: "bg-[#f5f7f4]", text: "text-[#72978c]", ring: "ring-[#d9e6e1]" },
  };
  const p = palettes[color] || palettes.green;

  const Icon = getIconForLabel(label);

  return (
    <div className={`${p.bg} rounded-2xl p-4 shadow-sm ring-1 ${p.ring}`}>
      <div className="flex items-center gap-3">
        <div className={`size-10 rounded-xl bg-white/80 border border-black/5 flex items-center justify-center`}>
          <Icon size={18} className={p.text} />
        </div>
        <div>
          <div className={`text-xl font-semibold leading-none ${p.text}`}>
            {value}
          </div>
          <p className="text-gray-600 text-sm mt-1">{label}</p>
        </div>
      </div>
    </div>
  );
}

function getIconForLabel(label = "") {
  const key = label.toLowerCase();
  if (key.includes("email")) return Mail;
  if (key.includes("ciudad")) return MapPin;
  if (key.includes("tel")) return Phone;
  if (key.includes("mascotas")) return PawPrint;
  return PawPrint;
}

function Field({ label, name, value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="block text-sm text-gray-700 mb-1">{label}</span>
      <input
        className="w-full rounded-xl border border-gray-300 px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#7d9a75] focus:border-[#7d9a75] transition-shadow"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </label>
  );
}
