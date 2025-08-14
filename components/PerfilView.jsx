export default function PerfilView({
  perfil, mensaje,
  onEdit, onOpenFile, onUploadAvatar, onCancelAvatar,
  avatarPreview, fileInputRef, resolveAvatarSrc,
  editMode, formData, onChange, onSubmit, saving, uploading, buildInfoCards
}) {
  return (
    <div className="rounded-3xl bg-white/95 border border-black/5 shadow-[0_12px_40px_rgba(0,0,0,0.08)] px-6 py-8 md:px-10 md:py-10 flex gap-6">
      {/* Avatar */}
      <div className="shrink-0 flex flex-col items-center">
        <img src={avatarPreview || resolveAvatarSrc(perfil)} alt="Perfil" className="w-50 h-50 rounded-full mb-3 object-cover border border-black/5"/>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onOpenFile}/>
        {!avatarPreview ? (
          <button onClick={() => fileInputRef.current?.click()} className="text-sm px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-50">Cambiar foto</button>
        ) : (
          <div className="flex gap-2">
            <button onClick={onUploadAvatar} disabled={uploading} className="text-sm px-3 py-1.5 rounded-md bg-[#7d9a75] text-white hover:bg-[#607859] disabled:opacity-60">
              {uploading ? "Subiendo..." : "Guardar"}
            </button>
            <button onClick={onCancelAvatar} className="text-sm px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-50">Cancelar</button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1">
        {mensaje && <div className="mb-4 text-sm rounded-lg px-3 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200">{mensaje}</div>}
        <h1 className="text-3xl font-bold text-gray-800 font-[Inter]">
          Bienvenido de vuelta,<span className="font-[Dancing_Script] text-[#df7a5e] text-4xl"> {perfil?.username}</span>
        </h1>
        <p className="mt-3 font-[Inter] text-gray-600 text-lg">Detrás de cada mascota feliz hay una persona como tú, dispuesta a dar amor sin esperar nada a cambio. Por ti, hoy hay más colitas moviéndose de felicidad y corazones latiendo con gratitud.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {buildInfoCards(perfil).map((c, i) => (
            <InfoCard key={i} color={c.color} value={c.value} label={c.label} />
          ))}
        </div>

        <div className="flex justify-end">
          <button onClick={onEdit} className="mt-6 bg-[#7d9a75] text-white px-6 py-3 rounded-md hover:bg-[#607859] transition-colors">Editar perfil</button>
        </div>

        {/* Modal edición */}
        {editMode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => !saving && onEdit(false)} />
            <form onSubmit={onSubmit} className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-black/5">
              <h2 className="text-xl font-semibold mb-4">Editar información</h2>
              <div className="grid grid-cols-1 gap-4">
                <Field label="Nombre de usuario" name="username" value={formData.username} onChange={onChange} placeholder="Tu nombre de usuario" />
                <Field label="Ciudad" name="ciudad" value={formData.ciudad} onChange={onChange} placeholder="Ej. Guadalajara, MX" />
                <Field label="Teléfono" name="telefono" value={formData.telefono} onChange={onChange} placeholder="Ej. 33-1234-5678" />
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => !saving && onEdit(false)} className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50" disabled={saving}>Cancelar</button>
                <button type="submit" className="px-5 py-2 rounded-md bg-[#7d9a75] text-white hover:bg-[#607859] disabled:opacity-60" disabled={saving}>
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

function InfoCard({ color = "green", value = "-", label = "" }) {
  const palettes = {
    salmon: { bg: "bg-[#fef6f3]", text: "text-[#bf7046]" },
    green: { bg: "bg-[#f5f7f4]", text: "text-[#72978c]" },
  };
  const p = palettes[color] || palettes.green;

  return (
    <div className={`${p.bg} rounded-lg p-4 shadow-md text-center`}>
      <label className={p.text}>
        <strong>{value}</strong>
      </label>
      <p className="text-gray-600">{label}</p>
    </div>
  );
}

function Field({ label, name, value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="block text-sm text-gray-700 mb-1">{label}</span>
      <input
        className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-[#7d9a75] focus:border-[#7d9a75]"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </label>
  );
}
