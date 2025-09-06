import Link from "next/link";

export default function SeccionMedia({ cantidadMascotas, texto }) {
    return (
        <section className="bg-white p-8 flex justify-between items-center">
            <div className="font-[Inter]">
                <h1 className="text-4xl font-bold text-gray-800">
                    Mascotas Disponibles
                </h1>
                <p className="mt-4 text-gray-600">
                    Mostrando {cantidadMascotas} mascotas {texto}
                </p>
            </div>

            <div>
                <Link href="/mascotas/nueva" className="bg-[#7d9a75] text-white px-4 py-2 rounded-md hover:bg-[#607859] transition-colors">
                    Nueva mascota
                </Link>
            </div>
        </section>
    );
}