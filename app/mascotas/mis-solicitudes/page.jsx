'use client';

import { useState,useEffect } from 'react';
import Link from 'next/link';

export default function MisSolicitudesPage() {
    const [solicitudes, setSolicitudes] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem("token");

        const fetchSolicitudes = async () => {
        const response = await fetch("http://localhost:8000/api/mascotas/solicitudes/mis-solicitudes/", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            
        });

        if (response.ok){
            const data = await response.json();
            setSolicitudes(data);
        }
        else {
            console.error("No se pudieron cargar las solicitudes");
        }
    
    };
    fetchSolicitudes();
    },[]);
    
    
    return(
        <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Mis Solicitudes de Adopción</h1>
        {solicitudes.length === 0 ? (
            <p>No hay solicitudes registradas.</p>
        ) : (
            <ul>
                {solicitudes.map((solicitud) => (
                    <li key={solicitud.id} className="border rounded p-4 mb-2">
                        <p><strong>Mascota:</strong> {solicitud.mascota_nombre}</p>
                        <p><strong>Adoptante:</strong> {solicitud.nombre_adoptante}</p>
                        <p><strong>Fecha:</strong> {new Date(solicitud.fecha_solicitud).toLocaleString()}</p>
                        <a
                            href={solicitud.url_formulario}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline"
                        >
                            Ver Formulario
                        </a>
                    </li>
                ))}
            </ul>
        )}
        <button className='bg-blue text-white p-2 mt-2 rounded'>
            <Link href="/veterinario" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Regresar
            </Link>
        </button>
    </div>
    );
}