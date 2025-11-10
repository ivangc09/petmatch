"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/FeedBack";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();
    const { show } = useToast();
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

    const handleLogin = async (e) => {
        e.preventDefault();

        const response = await fetch(`${API_BASE}/api/auth/custom-login/`, {
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
            if (data.error === "Invalid credentials") {
                show({ title: "Error", message: "Credenciales Incorrectas", variant: "error" });
            }
            else{
                show({ title: "Error", message: "Error en el inicio de sesión", variant: "error" });
            }
        }
    };

    return (
            <div className="shadow-lg flex flex-col md:flex-row w-full h-screen overflow-hidden font-['Poppins']">
                <div className="md:w-2/3 hidden md:block">
                    <img src="/login-fondo.webp" alt="Adopta una mascota" loading="lazy" className="h-full w-full object-cover"/>
                </div>

                <div className="bg-[#faf6f3] md:w-1/3 h-screen p-10 flex flex-col justify-center">
                    <h1 className="text-5xl font-bold text-[#2C2C2C] mb-2 font-['Dancing_Script'] text-center">PetMatch</h1>
                    <p className="text-[#555] mb-6 text-center font-['Poppins']">El lugar para conocer a tu nuevo amigo</p>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-[#2C2C2C]">Nombre de usuario</label>
                            <input type="username" placeholder="Usuario"
                                    className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D3764C]"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required/>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#2C2C2C]">Contraseña</label>
                            <input type="password" placeholder="Contraseña"
                                    className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D3764C]"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required/>
                        </div>

                        <button type="submit"
                            className="w-full bg-[#D3764C] hover:bg-[#C1643E] text-white font-semibold py-2 rounded-md transition duration-300">
                                Iniciar sesión
                        </button>

                        <p className="text-sm text-center mt-4 text-[#555]">
                            ¿Aún no tienes cuenta?
                            <Link href="/signup" className="text-[#D3764C] font-medium hover:underline"> Crear cuenta</Link>
                        </p>
                    </form>
                </div>
            </div>
    );
}
