"use client";

function Botones({ tipoUsuario }) {
    if (!tipoUsuario) return null;

    if (tipoUsuario === "adoptante") {
        return (
            <div className="flex justify-end mt-4 gap-4">
                <div>
                    <button className="mt-6 bg-[#7d9a75] text-white px-6 py-3 rounded-md hover:bg-[#607859] transition-colors">Me interesa</button>
                </div>
            </div>
        );
    }

    if (tipoUsuario === "veterinario") {
        return (
            <div className="flex justify-end mt-4 gap-4">
                <div>
                    <button className="mt-6 bg-[#7d9a75] text-white px-6 py-3 rounded-md hover:bg-[#607859] transition-colors">Editar</button>
                </div>
                <div>
                    <button className="mt-6 bg-[#e0795e] text-white px-6 py-3 rounded-md hover:bg-[#D3764C] transition-colors">Adoptado</button>
                </div>
                
            </div>
        );
    }

    return null;
}

export default function PetCard({ mascota, tipoUsuario }) {
    return (
        <div>
            <div className="md:h-1/3">
                {mascota.fotos && (
                <img
                    src={mascota.fotos}
                    alt={mascota.nombre}
                    className="w-full h-[200px] object-fill rounded-t-lg"
                />
                )}
            </div>

            <div className="flex flex-col md:h-2/3 p-4 font-[Inter] bg-white rounded-b-lg shadow-md">
                <div className="flex justify-between">
                    <h3 className="text-xl font-bold text-[#2b3136]">{mascota.nombre}</h3>
                    <p className="bg-[#fceae0] rounded-full text-[#9f5b53] pl-2 pr-2">{mascota.edad} años</p>
                </div>

                <div className="mt-4 mb-4">
                    {/* Quitar este lorem */}
                    <p className="text-[#959ca2]">Lorem ipsum, dolor sit amet consectetur adipisicing elit. Debitis nemo laborum qui neque, repellat labore pariatur rem soluta inventore eos, aut aperiam, necessitatibus fuga est veritatis deserunt ad unde. Veniam.</p>
                    <p className="text-[#959ca2] min-h-[70px] max-h-[70px] line-clamp-3">{mascota.descripcion}</p>
                </div>
                
                <div className="flex justify-center">
                    <div className="flex flex-col text-center">
                        <p>Especie</p>
                        <p className="text-[#959ca2]">{mascota.especie}</p>
                    </div>

                    <div className="flex flex-col ml-4 text-center">
                        <p>Ciudad</p>
                        <p className="text-[#959ca2]">Guadalajara</p>
                    </div>
                    
                    <div className="flex flex-col ml-4 text-center">
                        <p>Raza</p>
                        <p className="text-[#959ca2]">{mascota.raza}</p>
                    </div>

                </div>
                <Botones tipoUsuario={tipoUsuario} />     
            </div>
        </div>
    );

}