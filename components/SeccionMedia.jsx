export default function SeccionMedia({ cantidadMascotas }) {
    return (
        <section className="bg-white p-8">
            <div className="font-[Inter]">
                <h1 className="text-4xl font-bold text-gray-800">
                    Mascotas Disponibles
                </h1>
                <p className="mt-4 text-gray-600">
                    Mostrando {cantidadMascotas} mascotas disponibles para adopción.
                </p>
            </div>
        </section>
    );
}