import Link from "next/link";

import { useEffect,useState } from "react";


export default function SeccionMedia({ cantidadMascotas, texto }) {

    const [tipoUsuario, setTipoUsuario] = useState("");

    useEffect(() => {
        const usuario = localStorage.getItem("tipo_usuario");
        if (usuario) setTipoUsuario(usuario);
    }, []);

    return (
        <section className="bg-white p-8 flex justify-between items-center"id="mascotas-list">
            <div className="font-[Inter]">
                <h1 className="text-4xl font-bold text-gray-800">
                    Mascotas Disponibles
                </h1>
                <p className="mt-4 text-gray-600">
                    Mostrando {cantidadMascotas} mascotas {texto}
                </p>
            </div>

            {tipoUsuario === "veterinario" && (
                <div>
                    <Link href="/mascotas/nueva" className="bg-[#7d9a75] text-white px-4 py-2 rounded-md hover:bg-[#607859] transition-colors">
                        Nueva mascota
                    </Link>
                </div>
            )}
        </section>
    );
}