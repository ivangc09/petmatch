"use client";
import { useState,useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useToast } from "./FeedBack";

const PALETTE = {
  accent: "#7d9a75",
  accentHover: "#607859",
  text: "#2b3136",
  gradientFrom: "#fff6f1",
  gradientTo: "#fdeee7",
  warning: "#d26c49",
  light: "#f5f6f7",
  border: "#e5e7eb",
};

export default function AdoptionForm({ onSubmit }) {
  const { show } = useToast();
  const [loading, setLoading] = useState(false);
  const [okMsg, setOkMsg] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const searchParams = useSearchParams();
  const mascotaId = searchParams.get("petId");

  const [form, setForm] = useState({
	mascotaID: "",
    nombre: "",
    edad: "",
    ocupacion: "",
    estadoCivil: "",
    direccion: "",
    telefono: "",
    email: "",
    vivienda: "",
    protegida: "",
    esPropia: "",
    rentaPermite: "",
    horasSolo: "",
    ejercicio: "",
    tuvoMascotas: "",
    mascotasActuales: "",
    motivo: "",
    responsable: "",
    familiaDeAcuerdo: "",
    compromisoVida: "",
  });

  useEffect(() => {
	if(mascotaId){
		setForm((s) => ({ ...s, mascotaID: mascotaId }));
	}
  }, [mascotaId]);
  
  const [files, setFiles] = useState({
    idOficial: null,
    comprobante: null,
    extras: [],
  });

  const required = (v) => (v && String(v).trim() !== "");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleFile = (e) => {
    const { name, files: f } = e.target;
    if (name === "extras") {
      setFiles((s) => ({ ...s, extras: Array.from(f || []) }));
    } else {
      setFiles((s) => ({ ...s, [name]: f?.[0] || null }));
    }
  };

  const validate = () => {
    const reqFields = [
		"mascotaID",	
      	"nombre",
      	"edad",
      	"direccion",
      	"telefono",
      	"email",
      	"vivienda",
      	"protegida",
      	"esPropia",
      	"horasSolo",
      	"ejercicio",
      	"motivo",
      	"responsable",
      	"familiaDeAcuerdo",
      	"compromisoVida",
    ];
    const missing = reqFields.filter((k) => !required(form[k]));
    if (missing.length) {
      setErrMsg(show({title:"Error", message:`Faltan campos obligatorios: ${missing.join(", ")}`, variant:"danger"}));
      return false;
    }
    // validaciones puntuales
    if (!/^\d{2}$|^\d{1,2}$/.test(form.edad)) {
      setErrMsg(show({title:"Error", message:"Edad Invalida", variant:"danger"}));
      return false;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
      setErrMsg(show({title:"Error", message:"Correo Invalido", variant:"danger"}));
      return false;
    }
    if (!/^[0-9+\-\s()]{8,}$/.test(form.telefono)) {
      setErrMsg(show({title:"Error", message:"Telefono Invalido", variant:"danger"}));
      return false;
    }
    setErrMsg("");
    return true;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      setOkMsg("");

      const fd = new FormData();
      fd.append("payload", JSON.stringify(form));
	    fd.append("petId", form.mascotaID);
      if (files.idOficial) fd.append("id_oficial", files.idOficial);
      if (files.comprobante) fd.append("comprobante_domicilio", files.comprobante);
      files.extras.forEach((f, i) => fd.append(`extra_${i}`, f));

      if (onSubmit) {
        // si te paso un handler desde el padre
        await onSubmit(fd);
      } else {
        const token = localStorage.getItem("token");
        const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
        if(!token){
          console.warn("No hay access_token en localStorage")};
        await fetch(`${base}/api/mascotas/solicitudes/upload/`, {
          method: "POST",
          body: fd,
          headers: {...(token ? { Authorization: `Bearer ${token}` } : {}),
          Accept: "application/json"}
        });
      }

      setOkMsg(show({ title: "Éxito", message: "¡Solicitud enviada! Te contactaremos pronto!!", variant: "success" }));


	  	const keepId = form.mascotaID;
      	e.target.reset();
    	setForm({
			mascotaID:keepId,
      	  	nombre: "", edad: "", ocupacion: "", estadoCivil: "",
      	  	direccion: "", telefono: "", email: "",
      	  	vivienda: "", protegida: "", esPropia: "", rentaPermite: "",
      	  	horasSolo: "", ejercicio: "",
      	  	tuvoMascotas: "", mascotasActuales: "",
      	  	motivo: "", responsable: "",
      	  	familiaDeAcuerdo: "", compromisoVida: "",
      	});
      setFiles({ idOficial: null, comprobante: null, extras: [] });
    } catch (err) {
      setErrMsg(show({title:"Error", message:"Hubo un problema al enviar tu solicitud. Intenta de nuevo.", variant:"danger"}));
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-md border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-offset-1";
  const labelClass = "block text-sm font-semibold mb-1";
  const sectionClass =
    "bg-white rounded-xl shadow-sm p-5 md:p-6 border";

  return (
    <div
      className="min-h-screen py-10"
      style={{
        background: `linear-gradient(to bottom, ${PALETTE.gradientFrom}, ${PALETTE.gradientTo})`,
        color: PALETTE.text,
      }}
    >
      <div className="mx-auto max-w-6xl px-4 pt-4">
          <div className="flex items-center justify-between mb-4 text-sm text-[#6b7076]">
            <nav className="flex items-center gap-2">
              <Link href="/adoptante" >
                Panel
              </Link>
              <span aria-hidden>/</span>
              <Link href={`/mascotas/${mascotaId}`} >
                  Perfil
              </Link>
              <span aria-hidden>/</span>
              <span className="font-medium">Solicitud de Adopción</span>
            </nav>

            <Link
              href={`/mascotas/${mascotaId}`}
              className="rounded-xl px-4 py-2 bg-[#fceae0] text-[#9f5b53] hover:bg-[#f8dfd2]"
            >
              <span>←</span> Volver
            </Link>
          </div>
        </div>
      <div className="mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold" style={{ color: PALETTE.text }}>
            Solicitud de <span className="font-script" style={{ color: PALETTE.warning }}>Adopción</span>
          </h1>
          <p className="mt-2 opacity-80">Completa los datos básicos y adjunta tus documentos.</p>
        </div>

        <form onSubmit={submit} className="space-y-6">
          {/* 1. Datos personales */}
          <section className={sectionClass} style={{ borderColor: PALETTE.border }}>
            <h2 className="text-xl font-bold mb-4">1) Datos personales</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Nombre completo *</label>
                <input name="nombre" className={inputClass} onChange={handleChange} />
              </div>
              <div>
                <label className={labelClass}>Edad *</label>
                <input name="edad" type="number" min="18" className={inputClass} onChange={handleChange} />
              </div>
              <div>
                <label className={labelClass}>Ocupación</label>
                <input name="ocupacion" className={inputClass} onChange={handleChange} />
              </div>
              <div>
                <label className={labelClass}>Estado civil</label>
                <input name="estadoCivil" className={inputClass} onChange={handleChange} />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Dirección completa *</label>
                <input name="direccion" className={inputClass} onChange={handleChange} />
              </div>
              <div>
                <label className={labelClass}>Teléfono móvil *</label>
                <input name="telefono" className={inputClass} onChange={handleChange} />
              </div>
              <div>
                <label className={labelClass}>Correo electrónico *</label>
                <input name="email" type="email" className={inputClass} onChange={handleChange} />
              </div>
            </div>
          </section>

          {/* 2. Hogar */}
          <section className={sectionClass} style={{ borderColor: PALETTE.border }}>
            <h2 className="text-xl font-bold mb-4">2) Información sobre tu hogar</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Tipo de vivienda *</label>
                <select name="vivienda" className={inputClass} onChange={handleChange}>
                  <option value="">Selecciona…</option>
                  <option>Departamento</option>
                  <option>Casa pequeña</option>
                  <option>Casa grande</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>¿Está protegida para evitar fugas? *</label>
                <select name="protegida" className={inputClass} onChange={handleChange}>
                  <option value="">Selecciona…</option>
                  <option>Sí</option>
                  <option>No</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>¿Tu casa es propia? *</label>
                <select name="esPropia" className={inputClass} onChange={handleChange}>
                  <option value="">Selecciona…</option>
                  <option>Sí</option>
                  <option>No</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Si rentas: ¿permiten mascotas?</label>
                <select name="rentaPermite" className={inputClass} onChange={handleChange}>
                  <option value="">Selecciona…</option>
                  <option>Sí</option>
                  <option>No</option>
                  <option>No aplica</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Horas al día que estaría sola la mascota *</label>
                <select name="horasSolo" className={inputClass} onChange={handleChange}>
                  <option value="">Selecciona…</option>
                  <option>Nunca</option>
                  <option>2–4 horas</option>
                  <option>4–7 horas</option>
                  <option>Más de 7 horas</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Ejercicio diario que puedes darle *</label>
                <select name="ejercicio" className={inputClass} onChange={handleChange}>
                  <option value="">Selecciona…</option>
                  <option>Nada</option>
                  <option>30 minutos</option>
                  <option>1 hora</option>
                  <option>Más de 1 hora</option>
                </select>
              </div>
            </div>
          </section>

          {/* 3. Experiencia y motivación */}
          <section className={sectionClass} style={{ borderColor: PALETTE.border }}>
            <h2 className="text-xl font-bold mb-4">3) Experiencia y motivación</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>¿Has tenido mascotas antes?</label>
                <select name="tuvoMascotas" className={inputClass} onChange={handleChange}>
                  <option value="">Selecciona…</option>
                  <option>Sí</option>
                  <option>No</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>¿Tienes actualmente mascotas?</label>
                <select name="mascotasActuales" className={inputClass} onChange={handleChange}>
                  <option value="">Selecciona…</option>
                  <option>Sí</option>
                  <option>No</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>¿Por qué quieres adoptar? *</label>
                <textarea name="motivo" rows={4} className={inputClass} onChange={handleChange} />
              </div>
            </div>
          </section>

          {/* 4. Responsabilidad */}
          <section className={sectionClass} style={{ borderColor: PALETTE.border }}>
            <h2 className="text-xl font-bold mb-4">4) Responsabilidad</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Responsable del cuidado y gastos *</label>
                <input name="responsable" className={inputClass} onChange={handleChange} />
              </div>
              <div>
                <label className={labelClass}>¿Toda la familia está de acuerdo? *</label>
                <select name="familiaDeAcuerdo" className={inputClass} onChange={handleChange}>
                  <option value="">Selecciona…</option>
                  <option>Sí</option>
                  <option>No</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>¿Te comprometes a cuidar a la mascota toda su vida? *</label>
                <select name="compromisoVida" className={inputClass} onChange={handleChange}>
                  <option value="">Selecciona…</option>
                  <option>Sí</option>
                  <option>No</option>
                </select>
              </div>
            </div>
          </section>

          {/* 5. Adjuntos */}
          <section className={sectionClass} style={{ borderColor: PALETTE.border }}>
            <h2 className="text-xl font-bold mb-4">5) Documentos</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Identificación oficial (PDF/imagen)</label>
                <input type="file" name="idOficial" accept=".pdf,image/*" className="block w-full" onChange={handleFile} />
              </div>
              <div>
                <label className={labelClass}>Comprobante de domicilio (PDF/imagen)</label>
                <input type="file" name="comprobante" accept=".pdf,image/*" className="block w-full" onChange={handleFile} />
              </div>
            </div>
            <p className="text-xs mt-2 opacity-70">
              Al enviar aceptas que la información es verdadera y autorizas el contacto para seguimiento.
            </p>
          </section>

          {/* Acciones */}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-md font-semibold shadow-md transition"
              style={{
                background: PALETTE.accent,
                color: "white",
                opacity: loading ? 0.7 : 1,
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = PALETTE.accentHover)}
              onMouseOut={(e) => (e.currentTarget.style.background = PALETTE.accent)}
            >
              {loading ? "Enviando…" : "Enviar solicitud"}
            </button>

            <button
              type="reset"
              className="px-6 py-3 rounded-md font-semibold shadow-md transition text-white"
              style={{ background: PALETTE.warning }}
              onClick={() => {
                setErrMsg("");
                setOkMsg("");
              }}
            >
              Reiniciar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
