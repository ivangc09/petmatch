"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegistroPage() {
    const router = useRouter();

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
        <div style={{ maxWidth: 400, margin: "0 auto" }}>
            <h2>Registro de cuenta</h2>

            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="username"
                    placeholder="Nombre de usuario"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    style={{ width: "100%", marginBottom: 10 }}
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Correo electrónico"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    style={{ width: "100%", marginBottom: 10 }}
                />
                <input
                    type="password"
                    name="password1"
                    placeholder="Contraseña"
                    value={formData.password1}
                    onChange={handleChange}
                    required
                    style={{ width: "100%", marginBottom: 10 }}
                />
                <input
                    type="password"
                    name="password2"
                    placeholder="Confirmar contraseña"
                    value={formData.password2}
                    onChange={handleChange}
                    required
                    style={{ width: "100%", marginBottom: 10 }}
                />

                <label>Tipo de cuenta:</label>
                <select
                    name="tipo_usuario"
                    value={formData.tipo_usuario}
                    onChange={handleChange}
                    style={{ width: "100%", marginBottom: 20 }}
                >

                    <option value="adoptante">Adoptante</option>
                    <option value="veterinario">Veterinario / Albergue</option>
                </select>

                <button type="submit" style={{ width: "100%" }}>
                    Registrarse
                </button>
            </form>

            <button onClick={() => router.push("/login")} className="bg-white cursor-pointer text-black">
                Ya tengo cuenta, iniciar sesión
            </button>

            {registroExitoso && <p style={{ color: "green" }}>Registro exitoso ✅</p>}
            {error && <p style={{ color: "red" }}>Error: {JSON.stringify(error)}</p>}
        </div>
    );
}
