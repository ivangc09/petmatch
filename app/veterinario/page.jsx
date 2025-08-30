'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../../components/VeterinarioHeader';
import PetCard from '../../components/PetCard';
import SeccionMedia from '@/components/SeccionMedia';
import Hero from '@/components/Hero';

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
            console.log("Data recibida desde la API:", data);
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

            <Hero/>

            <div className='flex justify-between'>
                <SeccionMedia cantidadMascotas={mascotas.length} texto={"registradas"}/>
                <div className=''>
                    <button
                        onClick={() => router.push("/mascotas/nueva")}
                        className="m-6 bg-[#7d9a75] text-white px-6 py-3 rounded-md hover:bg-[#607859] transition-colors"
                    >
                        Añadir Mascota
                    </button>
                </div>
            </div>
            
            {mascotas.length === 0 ? (
                <div className='p-6'>
                    <h1 className='font-4xl font-[Poppins] text-gray-600'>Parece que aun no has registrado a ninguna mascota</h1>
                </div>
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
    );
}