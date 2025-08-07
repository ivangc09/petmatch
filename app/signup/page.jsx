"use client";
import { useState } from "react";
import Link from "next/link";

export default function RegistroPage() {

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password1: "",
        password2: "",
        tipo_usuario: "adoptante",
    });

    const [error, setError] = useState(null);
    const [registroExitoso, setRegistroExitoso] = useState(false);

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const response = await fetch("http://localhost:8000/api/auth/registration/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (response.ok) {
            console.log("✅ Registro exitoso:", data);
            setRegistroExitoso(true);
            setError(null);
            router.push("/login");
        } else {
            console.error("❌ Error:", data);
            setError(data);
            setRegistroExitoso(false);
        }
    };

    return (
        <div className="shadow-lg flex flex-col md:flex-row w-full h-screen overflow-hidden font-['Poppins']">
            <div className="bg-[#faf6f3] md:w-1/3 p-10 flex flex-col justify-center">
            <h1 className="text-5xl font-bold text-[#2C2C2C] mb-4 font-['Dancing_Script'] text-center">Registro de cuenta</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D3764C]"
                    type="text"
                    name="username"
                    placeholder="Nombre de usuario"
                    value={formData.username}
                    onChange={handleChange}
                    required
                />
                <input
                    className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D3764C]"
                    type="email"
                    name="email"
                    placeholder="Correo electrónico"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
                <input
                    className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D3764C]"
                    type="password"
                    name="password1"
                    placeholder="Contraseña"
                    value={formData.password1}
                    onChange={handleChange}
                    required
                />
                <input
                    className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D3764C]"
                    type="password"
                    name="password2"
                    placeholder="Confirmar contraseña"
                    value={formData.password2}
                    onChange={handleChange}
                    required
                />

                <label className="block text-m font-medium text-[#2C2C2C]">Tipo de cuenta:</label>
                <select
                    className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D3764C]"
                    name="tipo_usuario"
                    value={formData.tipo_usuario}
                    onChange={handleChange}
                >

                    <option value="adoptante">Adoptante</option>
                    <option value="veterinario">Veterinario / Albergue</option>
                </select>

                <button type="submit" className="w-full bg-[#D3764C] hover:bg-[#C1643E] text-white font-semibold py-2 rounded-md transition duration-300">
                    Registrarse
                </button>
            </form>

            <button className="text-sm text-center mt-4 text-[#555]">
                Ya tengo cuenta,
                <Link href="/login" className="text-[#D3764C] font-medium"> iniciar sesión</Link>
            </button>

            {registroExitoso && <p style={{ color: "green" }}>Registro exitoso ✅</p>}
            {error && <p style={{ color: "red" }}>Error: {JSON.stringify(error)}</p>}
            </div>

            <div className="md:w-2/3 hidden md:block">
                <img src="/registro-fondo.webp" alt="Adopta una mascota" loading="lazy" className="h-full w-full object-cover"/>
            </div>
        </div>
    );
}
