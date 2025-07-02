"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();

        const response = await fetch("http://localhost:8000/api/auth/custom-login/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (response.ok) {
            // Guardamos los datos por separado en localStorage
            localStorage.setItem("token", data.access_token);
            localStorage.setItem("tipo_usuario", data.user.tipo_usuario);
            localStorage.setItem("username", data.user.username);

            localStorage.setItem("user", JSON.stringify(data.user));

            router.push("/dashboard");
        } else {
            console.error("Error al iniciar sesión", data);
            alert("Credenciales incorrectas");
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: "0 auto" }}>
            <h2>Iniciar sesión</h2>

            <form onSubmit={handleLogin}>
                <input
                    type="text"
                    placeholder="Nombre de usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    style={{ display: "block", width: "100%", marginBottom: 10 }}
                />
                <input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ display: "block", width: "100%", marginBottom: 10 }}
                />
                <button type="submit" style={{ width: "100%" }}>
                    Iniciar sesión
                </button>
            </form>

            <hr style={{ margin: "20px 0" }} />

            <p>¿Aún no tienes cuenta?</p>
            <Link href="/signup" style={{ color: "blue", textDecoration: "underline" }}>
                Crear Cuenta
            </Link>
        </div>
    );
}
