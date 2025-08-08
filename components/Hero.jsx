import { FaFilter } from "react-icons/fa"
import { BiReset} from "react-icons/bi"

export default function Hero(){
    return(
        <section className="relative flex flex-col items-center text-center px-4 py-20 bg-gradient-to-b from-[#fff8f4] to-[#fef4f0]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-full bg-[#f8e8e1] opacity-50"></div>

            <div className="relative z-10 max-w-2xl">
                <h1 className="text-5xl font-bold text-gray-800 font-[Inter]">
                    Encuentra a tu Perfecta <span className="block text-[#D3764C] font-[Dancing_Script] text-6xl">Compañia</span>
                </h1>
                <p className="mt-4 text-gray-600">
                    Descubre mascotas increíbles que esperan su hogar para siempre. Cada perfil cuenta una historia única de resiliencia, amor y esperanza para un nuevo comienzo.
                </p>

                <div className="mt-8 bg-white shadow-lg rounded-xl p-4 flex items-center gap-4">
                    <input
                        type="text"
                        placeholder="Busca por nombre, raza, etc"
                        className="flex-1 px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-[#D3764C]"
                    />

                    <button className="mt-6 bg-[#7d9a75] text-white px-6 py-3 rounded-md hover:bg-[#607859] transition-colors">
                        <FaFilter className="inline mr-2" />
                        Filtros
                    </button>

                    <button className="mt-6 bg-[#D3764C] text-white px-6 py-3 rounded-md hover:bg-[#e0795e] transition-colors">
                        <BiReset className="inline mr-2"/>
                        Reiniciar
                    </button>
                </div>     
            </div>

        </section>
    )
}