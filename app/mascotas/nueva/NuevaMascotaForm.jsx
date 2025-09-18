"use client";
import { useId, useState } from "react";
import Link from "next/link";
import VeterinarioHeader from "@/components/VeterinarioHeader";

export default function NuevaMascotaForm({
  formData,
  error,
  tipoUsuario,
  cargandoRaza,
  handleChange,
  handleImageChange,
  handleDetectarRaza,
  handleSubmit,
}) {
  const EXCEPTIONS = {
    "Maine_Coon": "Maine Coon","keeshond": "Keeshond","basset_hound": "Basset Hound","samoyed": "Samoyedo","boxer": "Bóxer",
    "german_shorthaired": "Braco Alemán de Pelo Corto", "leonberger": "Leonberger", "american_bulldog": "Bulldog Americano", "Persian": "Persa", "Bombay": "Bombay", "wheaten_terrier": "Wheaten Terrier", "Bengal": "Bengalí", "pug": "Pug (Carlino)",
    "shiba_inu": "Shiba Inu", "Sphynx": "Sphynx (Esfinge)", "japanese_chin": "Chin Japonés", "chihuahua": "Chihuahua", "american_pit_bull_terrier": "Pit Bull Terrier Americano", "miniature_pinscher": "Pinscher Miniatura", "english_cocker_spaniel": "Cocker Spaniel Inglés",
    "British_Shorthair": "Británico de Pelo Corto", "english_setter": "Setter Inglés", "great_pyrenees": "Perro de Montaña de los Pirineos", "staffordshire_bull_terrier": "Staffordshire Bull Terrier", "pomeranian": "Pomerania", "Siamese": "Siamés", "saint_bernard": "San Bernardo",
    "newfoundland": "Terranova", "yorkshire_terrier": "Yorkshire Terrier", "scottish_terrier": "Terrier Escocés", "Ragdoll": "Ragdoll", "Russian_Blue": "Azul Ruso", "Abyssinian": "Abisinio", "beagle": "Beagle",
    "havanese": "Bichón Habanero", "Egyptian_Mau": "Mau Egipcio", "Birman": "Sagrado de Birmania", "golden_retriever": "Golden Retriever", "french_bulldog": "Bulldog Francés", "siberian_husky": "Husky Siberiano", "poodle": "Caniche (Poodle)",
    "doberman": "Dóberman","dachshund": "Teckel (Dachshund)","border_collie": "Border Collie","australian_shepherd": "Pastor Australiano","rottweiler": "Rottweiler","pitbull": "Pitbull","scottish_fold": "Scottish Fold",
    "norwegian_forest_cat": "Bosque de Noruega","himalayan": "Himalayo","american_shorthair": "Americano de Pelo Corto","turkish_angora": "Angora Turco","chartreux": "Chartreux (Cartujo)","cornish_rex": "Cornish Rex"
  };

  const nameId = useId();
  const breedId = useId();
  const ageId = useId();
  const sizeId = useId();
  const sexId = useId();
  const speciesId = useId();
  const descId = useId();
  const photoId = useId();
  const juguetonId = useId();
  const conviveOtrasMascotasId = useId();
  const conviveNinosId = useId();
  const nivelEnergiaId = useId();

  const [preview, setPreview] = useState(null);
  const [descCount, setDescCount] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  if (tipoUsuario !== "veterinario") {
    return (
      <p className="text-red-600 bg-red-50 border border-red-200 rounded-xl p-3 mx-4 my-6">
        No tienes permisos para acceder aquí.
      </p>
    );
  }

  function onLocalImageChange(e) {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    } else {
      setPreview(null);
    }
    handleImageChange?.(e);
  }

  function onDescChange(e) {
    setDescCount(e.target.value.length);
    handleChange?.(e);
  }

  function onDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }

  function onDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }

  function onDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];

    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      const fakeEvent = { target: { files: [file] } };
      handleImageChange?.(fakeEvent);
    }
  }

  const juguetonValue = formData?.es_jugueton ? "Si" : "No";
  const conviveNinosValue = formData?.convive_ninos ? "Si" : "No";
  const conviveMascotasValue = formData?.convive_otras_mascotas ? "Si" : "No";
  const nivelEnergiaValue =
    ((formData?.nivel_energia || "medio")[0]?.toUpperCase() || "M") +
    (formData?.nivel_energia || "medio").slice(1);

  return (
    <div className="min-h-screen bg-[#fff6f1] font-[Inter]">
      <VeterinarioHeader />

      {/* Breadcrumb + volver */}
      <div className="mx-auto max-w-6xl px-4 pt-4">
        <div className="flex items-center justify-between mb-4 text-sm text-[#6b7076]">
          <nav className="flex items-center gap-2">
            <Link href="/veterinario">Panel</Link>
            <span aria-hidden>/</span>
            <span className="font-medium">Nueva Mascota</span>
          </nav>

          <Link
            href="/veterinario"
            className="rounded-xl px-4 py-2 bg-[#fceae0] text-[#9f5b53] hover:bg-[#f8dfd2]"
          >
            <span>←</span> Volver
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-sm mt-2">
        <h2 className="text-2xl font-bold text-[#D3764C]">Registrar nueva mascota</h2>
        <p className="mt-1 text-sm text-[#6b7076]">
          Completa la información. Los campos marcados con <span className="text-[#D3764C]">*</span> son obligatorios.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-8">
          {/* Sección: Identidad */}
          <section>
            <h3 className="text-base font-semibold text-[#607859] mb-4">Identidad</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre */}
              <div>
                <label htmlFor={nameId} className="block text-sm font-medium text-gray-700">
                  Nombre <span className="text-[#D3764C]">*</span>
                </label>
                <input
                  id={nameId}
                  type="text"
                  name="nombre"
                  placeholder="Ej. Rocky, Pelusa"
                  onChange={handleChange}
                  required
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D3764C]"
                />
              </div>

              {/* Raza */}
              <div>
                <label htmlFor={breedId} className="block text-sm font-medium text-gray-700">
                  Raza <span className="text-[#D3764C]">*</span>
                </label>
                <input
                  id={breedId}
                  type="text"
                  name="raza"
                  value={EXCEPTIONS[formData?.raza] ?? formData?.raza ?? ""}
                  placeholder="Ej. Chihuahua, Persa"
                  onChange={handleChange}
                  required
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D3764C]"
                />
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleDetectarRaza}
                    disabled={!!cargandoRaza}
                    className="inline-flex items-center gap-2 bg-[#7d9a75] hover:bg-[#607859] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-4 py-2 rounded-lg transition"
                  >
                    {cargandoRaza ? (
                      <>
                        <span className="h-4 w-4 inline-block animate-spin border-2 border-white border-t-transparent rounded-full" />
                        Detectando…
                      </>
                    ) : (
                      <>Conocer raza</>
                    )}
                  </button>
                  <p className="text-xs text-[#6b7076]">
                    ¿No conoces la raza? Sube una foto y la intentamos identificar.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Sección: Datos físicos */}
          <section>
            <h3 className="text-base font-semibold text-[#607859] mb-4">Datos físicos</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Edad */}
              <div>
                <label htmlFor={ageId} className="block text-sm font-medium text-gray-700">
                  Edad (años) <span className="text-[#D3764C]">*</span>
                </label>
                <input
                  id={ageId}
                  type="number"
                  name="edad"
                  min={0}
                  placeholder="Ej. 2"
                  onChange={handleChange}
                  required
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D3764C]"
                />
              </div>

              {/* Tamaño */}
              <div>
                <label htmlFor={sizeId} className="block text-sm font-medium text-gray-700">
                  Tamaño
                </label>
                <select
                  id={sizeId}
                  name="tamaño"
                  onChange={handleChange}
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D3764C] bg-white"
                >
                  <option value="pequeño">Pequeño</option>
                  <option value="mediano">Mediano</option>
                  <option value="grande">Grande</option>
                </select>
              </div>

              {/* Sexo */}
              <div>
                <label htmlFor={sexId} className="block text-sm font-medium text-gray-700">
                  Sexo
                </label>
                <select
                  id={sexId}
                  name="sexo"
                  onChange={handleChange}
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D3764C] bg-white"
                >
                  <option value="macho">Macho</option>
                  <option value="hembra">Hembra</option>
                </select>
              </div>

              {/* Especie */}
              <div>
                <label htmlFor={speciesId} className="block text-sm font-medium text-gray-700">
                  Especie
                </label>
                <select
                  id={speciesId}
                  name="especie"
                  onChange={handleChange}
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D3764C] bg-white"
                >
                  <option value="perro">Perro</option>
                  <option value="gato">Gato</option>
                </select>
              </div>
            </div>
          </section>

          {/* Sección: Perfil Conductual */}
          <section>
            <h3 className="text-base font-semibold text-[#607859] mb-4">Perfil Conductual</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label htmlFor={juguetonId} className="block text-sm font-medium text-gray-700">
                  ¿Es juguetón?
                </label>
                <select
                  id={juguetonId}
                  name="jugueton"
                  value={juguetonValue}
                  onChange={handleChange}
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D3764C] bg-white"
                >
                  <option value="Si">Sí</option>
                  <option value="No">No</option>
                </select>
              </div>

              <div>
                <label htmlFor={conviveNinosId} className="block text-sm font-medium text-gray-700">
                  ¿Convive con niños?
                </label>
                <select
                  id={conviveNinosId}
                  name="conviveNinos"
                  value={conviveNinosValue}
                  onChange={handleChange}
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D3764C] bg-white"
                >
                  <option value="Si">Sí</option>
                  <option value="No">No</option>
                </select>
              </div>

              <div>
                <label htmlFor={conviveOtrasMascotasId} className="block text-sm font-medium text-gray-700">
                  ¿Convive con mascotas?
                </label>
                <select
                  id={conviveOtrasMascotasId}
                  name="conviveOtrasMascotas"
                  value={conviveMascotasValue}
                  onChange={handleChange}
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D3764C] bg-white"
                >
                  <option value="Si">Sí</option>
                  <option value="No">No</option>
                </select>
              </div>

              <div>
                <label htmlFor={nivelEnergiaId} className="block text-sm font-medium text-gray-700">
                  Nivel de energía
                </label>
                <select
                  id={nivelEnergiaId}
                  name="nivelEnergia"
                  value={nivelEnergiaValue}
                  onChange={handleChange}
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D3764C] bg-white"
                >
                  <option value="Bajo">Bajo</option>
                  <option value="Medio">Medio</option>
                  <option value="Alto">Alto</option>
                </select>
              </div>
            </div>
          </section>

          {/* Sección: Foto */}
          <section>
            <h3 className="text-base font-semibold text-[#607859] mb-4">Foto</h3>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-4 items-start">
              {/* Dropzone */}
              <div>
                <label htmlFor={photoId} className="sr-only">
                  Foto
                </label>

                <div
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  className={[
                    "border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer bg-white transition",
                    dragActive ? "bg-[#fdeee7]/40 border-[#D3764C]" : "border-[#e6d6cd] hover:bg-[#fdeee7]/30",
                  ].join(" ")}
                >
                  <input
                    id={photoId}
                    type="file"
                    accept="image/*"
                    onChange={onLocalImageChange}
                    className="hidden"
                  />
                  <label htmlFor={photoId} className="text-center text-sm text-[#6b7076]">
                    Arrastra y suelta una imagen o{" "}
                    <span className="text-[#9f5b53] underline">haz clic para subir</span>
                  </label>
                  <p className="text-xs text-[#6b7076]">Formatos: JPG/PNG. Tamaño recomendado &lt; 5MB.</p>
                </div>
              </div>

              {/* Preview */}
              <div className="rounded-xl overflow-hidden border bg-white min-h-[220px] flex items-center justify-center">
                {preview ? (
                  <img src={preview} alt="Vista previa" className="object-cover w-full h-full" />
                ) : (
                  <div className="flex flex-col items-center justify-center text-[#6b7076] py-6">
                    <div className="h-16 w-16 rounded-xl border border-dashed" />
                    <span className="text-xs mt-2">Vista previa</span>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Sección: Descripción */}
          <section>
            <h3 className="text-base font-semibold text-[#607859] mb-2">Descripción</h3>
            <textarea
              id={descId}
              name="descripcion"
              placeholder="Personalidad, comportamiento, cuidados especiales, estado de salud, etc."
              onChange={onDescChange}
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D3764C] min-h-[120px] resize-y"
              maxLength={600}
              aria-describedby={`${descId}-help`}
            />
            <div className="flex justify-between text-xs text-[#6b7076] mt-1">
              <span id={`${descId}-help`}>
                Consejo: sé específico para ayudar a encontrar el mejor adoptante.
              </span>
              <span>{descCount}/600</span>
            </div>
          </section>

          {/* Acciones */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <div className="text-xs text-[#6b7076]">
              Al guardar, la mascota quedará <span className="font-medium">Disponible</span> por defecto.
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-[#7d9a75] hover:bg-[#607859] text-white font-semibold px-6 py-2 rounded-lg transition"
              >
                Guardar mascota
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
