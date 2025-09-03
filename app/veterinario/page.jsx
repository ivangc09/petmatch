'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/VeterinarioHeader';
import PetCard from '../../components/PetCard';
import SeccionMedia from '@/components/SeccionMedia';
import Hero from '@/components/Hero';

export default function VeterinarioDashboard() {
    const router = useRouter();
    const [mascotas, setMascotas] = useState([]);
    const [tipoUsuario, setTipoUsuario] = useState("");
    const [token, setToken] = useState("");
    const [error, setError] = useState(null);
    
      // Carga inicial + guardia de ruta
      useEffect(() => {
        const t = localStorage.getItem("token");
        const tipo = localStorage.getItem("tipo_usuario");
    
        if (!t || tipo !== "veterinario") {
            router.push("/login");
            return;
        }
    
        setTipoUsuario(tipo);
        setToken(t);
    
        // Carga inicial (sin filtros)
        fetch("http://localhost:8000/api/mascotas/mis-mascotas/", {
          headers: { Authorization: `Bearer ${t}` },
        })
          .then((res) => {
            if (!res.ok) throw new Error(`Error ${res.status}`);
            return res.json();
          })
          .then((data) => setMascotas(Array.isArray(data) ? data : (data.results ?? [])))
          .catch(() => setError("Error al obtener mascotas"));
      }, [router]);
    
      if (error) return <p>{error}</p>;
    
      return (
        <main>
          <Header />
    
          {/* El Hero ahora controla la búsqueda y manda resultados acá vía onResults */}
          <Hero
            apiBase="http://localhost:8000"
            endpointPath="/api/mascotas/mis-mascotas/"
            token={token}
            onResults={(items) => setMascotas(items)}
            titulo="Organiza a tus Pacientes"
            subtitulo="Peludos"
            texto="Gestiona y encuentra rápidamente a tus pacientes peludos. Cada perfil contiene información esencial para brindarles el mejor cuidado."
          />
    
          <SeccionMedia cantidadMascotas={mascotas.length} texto={"listas para adoptar"} />
    
          <div className="flex gap-4 justify-center flex-wrap bg-[#f6f5f3]">
            {mascotas.map((mascota) => (
              <div key={mascota.id} className="p-6 mb-4 max-w-md">
                <PetCard mascota={mascota} tipoUsuario={tipoUsuario} />
              </div>
            ))}
          </div>
    
        </main>
      );
    }