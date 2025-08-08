"use client";

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import DetallesMascota from '@/components/DetallesMascota';
import Comentarios from '@/components/Comentarios';
import AdoptanteHeader from '@/components/AdoptanteHeader';
import Hero from '@/components/Hero';

export default function AdoptanteDashboard() {
    const router = useRouter();
    const [mascotas, setMascotas] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const tipo = localStorage.getItem("tipo_usuario");

        if (!token || tipo !== "adoptante") {
            router.push("/login");
            return;
        }

        fetch("http://localhost:8000/api/mascotas/ver-mascotas/", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => res.json())
            .then((data) => setMascotas(data))
            .catch((err) => setError("Error al obtener mascotas"));
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/login');
    };

    if (error) return <p>{error}</p>;

    return (
        <main>
            <AdoptanteHeader />

            <Hero />
            <div>
                <h2>Mascotas Disponibles para Adopción</h2>
                <ul>
                    {mascotas.map((mascota) => (
                        <li key={mascota.id} className="border rounded p-4 mb-4">
                            <h3>{mascota.nombre}</h3>
                            <p>Edad: {mascota.edad} años</p>
                            <p>Especie: {mascota.especie}</p>
                            <p>Raza: {mascota.raza}</p>
                            {mascota.fotos && (
                                <img
                                    src={mascota.fotos}
                                    alt={mascota.nombre}
                                    className="mt-2 w-48 h-48 object-cover rounded"
                                />
                            )}

                            <DetallesMascota mascota={mascota} />
                            <Comentarios mascotaId={mascota.id} />
                        </li>
                    ))}
                </ul>
                
            </div>

            <button className='bg-blue text-white p-2 mt-2 rounded'>
                <Link href="/mi-perfil" className="text-white">
                    Mi Perfil
                </Link>
            </button>

        </main>
    );
}
