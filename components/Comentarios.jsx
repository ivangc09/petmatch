"use client";
import { useState, useEffect } from "react";

export default function Comentarios({ mascotaId }) {
    const [comentarios, setComentarios] = useState([]);
    const [nuevoComentario, setNuevoComentario] = useState("");

    useEffect(() => {
        fetch(`http://localhost:8000/api/mascotas/comentarios/${mascotaId}/`)
            .then(res => res.json())
            .then(data => setComentarios(data));
    }, [mascotaId]);

    const enviarComentario = async () => {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:8000/api/mascotas/comentarios/crear/", {
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
        <div>
            <h3>Comentarios</h3>
            <textarea
                value={nuevoComentario}
                onChange={(e) => setNuevoComentario(e.target.value)}
                placeholder="Escribe tu comentario"
                className="w-full p-2 border rounded"
            />
            <button onClick={enviarComentario} className="bg-blue-500 text-white p-2 mt-2 rounded">
                Enviar
            </button>
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
