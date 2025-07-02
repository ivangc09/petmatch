"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NuevaMascotaPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nombre: "",
    especie: "perro",
    raza: "",
    edad: "",
    tamaño: "mediano",
    sexo: "macho",
    descripcion: "",
  });

  const [imagen, setImagen] = useState(null);
  const [error, setError] = useState(null);
  const [tipoUsuario, setTipoUsuario] = useState("");

  useEffect(() => {
    const tipo = localStorage.getItem("tipo_usuario");
    const token = localStorage.getItem("token");

    if (tipo && token) {
      setTipoUsuario(tipo);
    } else {
      router.push("/login");
    }
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleImageChange = (e) => {
    setImagen(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const data = new FormData();
    for (const key in formData) {
      data.append(key, formData[key]);
    }
    if (imagen) {
      data.append("fotos", imagen);
    }

    const response = await fetch("http://localhost:8000/api/mascotas/crear/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: data,
    });

    if (response.ok) {
      router.push("/veterinario");
    } else {
      const errorData = await response.json();
      setError(errorData.detail || "Error al registrar la mascota");
    }
  };

  if (tipoUsuario !== "veterinario") {
    return <p className="text-red-500">No tienes permisos para acceder aquí.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Registrar Mascota</h2>

      <input type="text" name="nombre" placeholder="Nombre" onChange={handleChange} required />

      <select name="especie" onChange={handleChange}>
        <option value="perro">Perro</option>
        <option value="gato">Gato</option>
      </select>

      <input type="text" name="raza" placeholder="Raza" onChange={handleChange} required />
      <input type="number" name="edad" placeholder="Edad" onChange={handleChange} required />

      <select name="tamaño" onChange={handleChange}>
        <option value="pequeño">Pequeño</option>
        <option value="mediano">Mediano</option>
        <option value="grande">Grande</option>
      </select>

      <select name="sexo" onChange={handleChange}>
        <option value="macho">Macho</option>
        <option value="hembra">Hembra</option>
      </select>

      <textarea name="descripcion" placeholder="Descripción" onChange={handleChange}></textarea>

      <input type="file" accept="image/*" onChange={handleImageChange} />

      {error && <p className="text-red-500">{error}</p>}

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Guardar Mascota
      </button>
    </form>
  );
}
