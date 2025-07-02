"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function PerfilPage() {
    const [perfil, setPerfil] = useState(null);
    const [formData, setFormData] = useState({ username: "" });
    const [editMode, setEditMode] = useState(false);
    const [mensaje, setMensaje] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        fetch("http://localhost:8000/api/auth/mi-perfil/", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => res.json())
            .then((data) => {
                setPerfil(data);
                setFormData({ username: data.username });
            });
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        const token = localStorage.getItem("token");
        try {
            const res = await fetch("http://localhost:8000/api/auth/mi-perfil/", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                const data = await res.json();
                setPerfil(data);
                setEditMode(false);
                setMensaje("Perfil actualizado correctamente");
            } else {
                setMensaje("Error al actualizar perfil");
            }
        } catch {
            setMensaje("Error de red");
        }
    };

    if (!perfil) return <p>Cargando perfil...</p>;

    return (
        <div className="p-4 max-w-xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Mi Perfil</h1>
            {mensaje && <p className="text-green-600 mb-2">{mensaje}</p>}
            <p><strong>Email:</strong> {perfil.email}</p>
            <p><strong>Tipo de usuario:</strong> {perfil.tipo_usuario}</p>

            {editMode ? (
                <>
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className="border p-2 w-full my-2"
                    />
                    <button onClick={handleSubmit} className="bg-blue-600 text-white p-2 rounded">Guardar</button>
                    <button onClick={() => setEditMode(false)} className="ml-2 p-2">Cancelar</button>
                </>
            ) : (
                <>
                    <p><strong>Username:</strong> {perfil.username}</p>
                    <button onClick={() => setEditMode(true)} className="bg-gray-800 text-white px-4 py-2 rounded mt-2">
                        Editar Perfil
                    </button>
                </>
            )}
            <button>
                <Link href="/dashboard" className="bg-blue-600 text-white px-4 py-2 rounded mt-2">
                    Volver al Inicio
                </Link>
            </button>
        </div>
    );
}
