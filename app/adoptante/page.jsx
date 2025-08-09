"use client";

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import AdoptanteHeader from '@/components/AdoptanteHeader';
import Hero from '@/components/Hero';
import PetCard from '@/components/PetCard';
import SeccionMedia from '@/components/SeccionMedia';

export default function AdoptanteDashboard() {
    const router = useRouter();
    const [mascotas, setMascotas] = useState([]);
    const [tipoUsuario, setTipoUsuario] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const tipo = localStorage.getItem("tipo_usuario");

        if (!token || tipo !== "adoptante") {
            router.push("/login");
            return;
        }

        setTipoUsuario(tipo);

        fetch("http://localhost:8000/api/mascotas/ver-mascotas/", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => res.json())
            .then((data) => setMascotas(data))
            .catch((err) => setError("Error al obtener mascotas"));
    }, [router]);

    if (error) return <p>{error}</p>;

    return (
        <main>
            <AdoptanteHeader />

            <Hero />
            <SeccionMedia cantidadMascotas={mascotas.length}/>
            <div className='flex gap-4 justify-center flex-wrap bg-[#f6f5f3]'>
                    {mascotas.map((mascota) => (
                        <div key={mascota.id} className="p-6 mb-4 max-w-md">            
                            <PetCard mascota={mascota} tipoUsuario={tipoUsuario}/>
                        </div>
                    ))}
                
            </div>

        </main>
    );
}
