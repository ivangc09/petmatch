"use client";
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
    if (tipoUsuario !== "veterinario") {
        return <p className="text-red-500">No tienes permisos para acceder aquí.</p>;
    }

    return (
        <div>
            <VeterinarioHeader />
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-md mt-10 font-['Poppins']">
            <h2 className="text-2xl font-bold text-[#D3764C] mb-4">
                Registrar nueva mascota
            </h2>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
                {/* Nombre */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                    <input
                        type="text"
                        name="nombre"
                        placeholder="Ej. Rocky, Peludo"
                        onChange={handleChange}
                        required
                        className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#D3764C]"
                />
                </div>

                {/* Raza */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Raza</label>
                    <input
                        type="text"
                        name="raza"
                        value={formData.raza}
                        placeholder="Ej. Chihuahua, Persa"
                        onChange={handleChange}
                        required
                        className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#D3764C]"
                    />

                    <label className="block text-sm font-medium text-gray-700 mt-2">
                        Si no conoces la raza, sube la imagen y lo averiguamos por ti.
                    </label>
                    <button
                        type="button"
                        onClick={handleDetectarRaza}
                        disabled={cargandoRaza}
                        className="bg-[#D3764C] hover:bg-[#C1643E] text-white font-semibold px-6 py-2 rounded-md transition"
                    >
                        {cargandoRaza ? "Detectando..." : "Conocer Raza"}
                    </button>
                </div>

                {/* Edad */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Edad</label>
                    <input
                        type="number"
                        name="edad"
                        placeholder="Edad"
                        onChange={handleChange}
                        required
                        className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#D3764C]"
                    />
                </div>

                {/* Selects */}
                <div className="flex justify-around mt-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tamaño</label>
                        <select
                            name="tamaño"
                            onChange={handleChange}
                            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#D3764C]"
                        >
                            <option value="pequeño">Pequeño</option>
                            <option value="mediano">Mediano</option>
                            <option value="grande">Grande</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Sexo</label>
                        <select
                            name="sexo"
                            onChange={handleChange}
                            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#D3764C]"
                        >
                            <option value="macho">Macho</option>
                            <option value="hembra">Hembra</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Especie</label>
                        <select
                            name="especie"
                            onChange={handleChange}
                            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#D3764C]"
                        >
                            <option value="perro">Perro</option>
                            <option value="gato">Gato</option>
                        </select>
                    </div>
                </div>

                {/* Descripción */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Descripción</label>
                    <textarea
                        name="descripcion"
                        placeholder="Escribe algo..."
                        onChange={handleChange}
                        className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#D3764C]"
                    ></textarea>
                </div>

                {/* Foto */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Foto</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full mt-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-[#D3764C] file:text-white hover:file:bg-[#C1643E]"
                    />
                </div>

                {/* Botones */}
                <div className="flex justify-between">
                    <Link
                        href="/veterinario"
                        className="bg-[#D3764C] hover:bg-[#C1643E] text-white font-semibold px-6 py-2 rounded-md transition"
                    >
                        Regresar
                    </Link>

                    <button
                        type="submit"
                        className="bg-[#D3764C] hover:bg-[#C1643E] text-white font-semibold px-6 py-2 rounded-md transition"
                    >
                        Guardar Mascota
                    </button>
                </div>

                {error && <p className="text-red-500">{error}</p>}
            </form>
        </div>
        </div>
        
    );
}
