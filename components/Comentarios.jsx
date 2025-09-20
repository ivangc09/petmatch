"use client";
import { useState, useEffect } from "react";

export default function Comentarios({ mascotaId }) {
    const [comentarios, setComentarios] = useState([]);
    const [nuevoComentario, setNuevoComentario] = useState("");
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

    useEffect(() => {
        fetch(`${API_BASE}/api/mascotas/comentarios/${mascotaId}/`)
            .then(res => res.json())
            .then(data => setComentarios(data));
    }, [mascotaId]);

    const enviarComentario = async () => {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE}/api/mascotas/comentarios/crear/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                mascota: mascotaId,
                texto: nuevoComentario,
            }),
        });
        if (response.ok) {
            setNuevoComentario("");
            const nuevo = await response.json();
            setComentarios([nuevo, ...comentarios]);
        }
    };

    return (
        <div className="mt-5 bg-white p-4 rounded-lg shadow-md">
            <h1 className="">Comentarios</h1>
            <textarea
                value={nuevoComentario}
                onChange={(e) => setNuevoComentario(e.target.value)}
                placeholder="Escribe tu comentario"
                className="mt-3 w-full p-2 border rounded"
            />
            
            <div className="flex justify-end mt-2">
                <button onClick={enviarComentario} className="rounded-xl px-5 py-3 bg-[#e0795e] text-white hover:bg-[#D3764C] transition-colors">
                    Enviar
                </button>
            </div>
            <ul className="mt-4">
                {comentarios.map((comentario) => (
                    <li key={comentario.id} className="mb-2 border-b pb-2">
                        <strong>{comentario.autor_username}:</strong> {comentario.texto}
                    </li>
                ))}
            </ul>
        </div>
    );
}
