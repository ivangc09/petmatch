"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/FeedBack";

const API_BASE =
    (typeof window !== "undefined" && process.env.NEXT_PUBLIC_API_BASE) ||
    "http://localhost:8000";

export default function RegistroPage() {
    const router = useRouter();
    const { show } = useToast();

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password1: "",
        password2: "",
        tipo_usuario: "adoptante",
        ciudad: "",
        telefono: "",
    });

    const [error, setError] = useState(null);
    const [registroExitoso, setRegistroExitoso] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

    if (formData.password1 !== formData.password2) {
        const msg = "Las contraseñas no coinciden.";
        show({ title: "Error", message: msg, variant: "danger" });
        setError({ detail: msg });
        return;
    }

    setSubmitting(true);
    setError(null);

    try {
        const response = await fetch(`${API_BASE}/api/auth/registration/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });

        let data = null;
        try {
            data = await response.json();
        } catch {
            data = null;
        }

        if (response.ok) {
            show({ title: "Éxito", message: "Registro exitoso.", variant: "success" });
            setRegistroExitoso(true);
            setError(null);
            setTimeout(() => router.push("/login"), 400);
        } else {
            const msg =
                data?.detail ||
                data?.non_field_errors?.[0] ||
                data?.email?.[0] ||
                data?.username?.[0] ||
                data?.password1?.[0] ||
                data?.password2?.[0] ||
                data?.tipo_usuario?.[0] ||
                "Error en el registro.";

            show({ title: "Error", message: msg, variant: "danger" });
            setError(data || { detail: msg });
            setRegistroExitoso(false);
        }
    } catch (err) {
        const msg = "No se pudo conectar con el servidor.";
        show({ title: "Error", message: msg, variant: "danger" });
        setError({ detail: err?.message || msg });
        setRegistroExitoso(false);
    } finally {
        setSubmitting(false);
    }
    };

    return (
        <div className="shadow-lg flex flex-col md:flex-row w-full h-screen overflow-hidden font-['Poppins']">
            <div className="bg-[#faf6f3] md:w-1/3 h-screen p-10 flex flex-col justify-center">
                <h1 className="text-5xl font-bold text-[#2C2C2C] mb-4 font-['Dancing_Script'] text-center">
                    Registro de cuenta
                </h1>

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

                    <div className="flex gap-4">
                        <input
                            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D3764C]"
                            type="text"
                            name="ciudad"
                            placeholder="Ciudad"
                            value={formData.ciudad}
                            onChange={handleChange}
                        />
                        <input
                            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D3764C]"
                            type="text"
                            name="telefono"
                            placeholder="Teléfono"
                            value={formData.telefono}
                            onChange={handleChange}
                        />
                    </div>

                    <label className="block text-m font-medium text-[#2C2C2C]">
                        Tipo de cuenta:
                    </label>

                    <select
                        className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D3764C]"
                        name="tipo_usuario"
                        value={formData.tipo_usuario}
                        onChange={handleChange}
                    >
                        <option value="adoptante">Adoptante</option>
                        <option value="veterinario">Veterinario / Albergue</option>
                    </select>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-[#D3764C] hover:bg-[#C1643E] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2 rounded-md transition duration-300"
                    >
                        {submitting ? "Registrando..." : "Registrarse"}
                    </button>
                </form>

                <button className="text-sm text-center mt-4 text-[#555]">
                    Ya tengo cuenta,{" "}
                    <Link href="/login" className="text-[#D3764C] font-medium">
                        iniciar sesión
                    </Link>
                </button>

            </div>

            <div className="md:w-2/3 hidden md:block">
                <img
                    src="/registro-fondo.webp"
                    alt="Adopta una mascota"
                    loading="lazy"
                    className="h-full w-full object-cover"
                />
            </div>
        </div>
    );
}   