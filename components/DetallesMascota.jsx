"use client";

import { useState } from "react";

export default function DetallesMascota({ mascota }) {
    const [formData, setFormData] = useState(null);
    const [modalAbierto, setModalAbierto] = useState(false);

    const handleSubmit = async () => {
        if (!formData) {
            alert("Selecciona un archivo");
        return;
        }

        const formDataObj = new FormData();
        formDataObj.append("documento", formData);
        formDataObj.append("mascota_id", mascota.id);

        const token = localStorage.getItem("token");
        try {
            const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
            const response = await fetch(`${API_BASE}/api/mascotas/solicitudes/upload/`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formDataObj,
            });

            if (response.ok) {
                alert("Solicitud enviada correctamente");
                setFormData("");
                setModalAbierto(false);
            } else {
                alert("Error al enviar la solicitud");
            }
        } catch (err) {
            alert("Error de red al enviar la solicitud");
        }
    };

    return (
        <div>
            <button
                className="bg-green-600 text-white px-4 py-1 mt-2 rounded-full"
                onClick={() => setModalAbierto(true)}
            >
                Me interesa
            </button>

            {modalAbierto && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-[#9ba1a7] rounded-lg shadow-lg p-4 w-96 relative">
                        <button
                            className="absolute top-2 right-2 text-gray-600"
                            onClick={() => setModalAbierto(false)}
                        >
                            ✖
                        </button>

                        <div className="text-xl font-medium text-slate-800 text-white mb-2">
                            {mascota.nombre}
                        </div>
                        {mascota.fotos && (
                                <img
                                    src={mascota.fotos}
                                    alt={mascota.nombre}
                                    className="mt-2 w-48 h-48 object-cover rounded"
                                />
                        )}
                        <p>Edad: {mascota.edad} años</p>
                        <p>Especie: {mascota.especie}</p>
                        <p>Raza: {mascota.raza}</p>
                        <p>{mascota.descripcion}</p>

                        <a
                            href="/documentos/SOLICITUDDEADOP.pdf"
                            download
                            className="bg-green-600 text-white px-4 py-2 rounded mt-4 inline-block"
                        >
                            Descargar Formulario de Adopción
                        </a>

                        <input
                            type="file"
                            onChange={(e) => setFormData(e.target.files[0])}
                            className="w-full border rounded px-2 py-1 mt-2"
                        />

                        <button
                            onClick={handleSubmit}
                            className="bg-blue-600 text-white px-4 py-2 rounded mt-2 w-full"
                        >
                            Enviar Formulario
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
