'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../../components/VeterinarioHeader';
import PetCard from '../../components/PetCard';

export default function VeterinarioDashboard() {
    const router = useRouter();
    const [tipoUsuario, setTipoUsuario] = useState("");
    const [mascotas, setMascotas] = useState([]);

    useEffect(() => {
    const tipo = localStorage.getItem("tipo_usuario");
    const token = localStorage.getItem("token");

    if (!token || tipo !== "veterinario") {
        router.push("/login");
        return;
    }

    setTipoUsuario(tipo);

    const fetchMascotas = async () => {
        const response = await fetch("http://localhost:8000/api/mascotas/mis-mascotas/", {
            method: "GET",
            headers: {
            Authorization: `Bearer ${token}`,
            },
        });

        if (response.ok) {
            const data = await response.json();
            console.log("🐶 Data recibida desde la API:", data);
            setMascotas(data);
        } else {
            console.error("No se pudieron cargar las mascotas");
        }
        };

    fetchMascotas();
    }, []);

    return (
        <div>
            <Header />

            <div className="">

            <h1 className="text-2xl font-bold mb-4">Panel del Veterinario</h1>

            <button
                onClick={() => router.push("/mascotas/nueva")}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mb-6"
            >
                ➕ Añadir Mascota
            </button>

            <h2 className="text-xl font-semibold mb-2">Tus Mascotas Registradas</h2>

                {mascotas.length === 0 ? (
                <p>No has registrado mascotas aún.</p>
            ) : (
            <div className='flex gap-4 justify-center flex-wrap bg-[#f6f5f3]'>
                {mascotas.map((mascota) => (
                <div key={mascota.id} className="p-6 mb-4 max-w-md">
                    <PetCard mascota={mascota} tipoUsuario={tipoUsuario} />
                    
                </div>
                
                ))}
            </div>
        )}
        </div>

        </div>
        
    );
}