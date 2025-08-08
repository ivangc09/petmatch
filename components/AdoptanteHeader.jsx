import { FaPaw, FaBell } from 'react-icons/fa';
import Link from 'next/link';
import BotonCerrarSesion from '@/components/BotonCerrarSesión';

export default function AdoptanteHeader() {
    return(
        <header className="w-full bg-white shadow-md p-4 flex">
            <div className='flex justify-center'>
                <Link href="/adoptante" className='flex items-center gap-3 text-[#e0795e]'>
                    <FaPaw size={28}/>
                    <h1 className="text-5xl font-bold text-[#e0795e] font-['Dancing_Script']">PetMatch</h1>
                </Link>
            </div>

            <div className='font-["Poppins"] ml-auto flex items-center gap-4'>
                <FaBell size={24} className="text-[#7d8181] hover:text-[#D3764C] cursor-pointer" />
                <Link href="" className="ml-4 text-[#7d8181] hover:text-[#D3764C]">
                    Encontrar mascotas
                </Link>
                <Link href="" className="ml-4 text-[#7d8181] hover:text-[#D3764C]">
                    ¿Cómo adoptar?
                </Link>
                <Link href="/mi-perfil" className="ml-4 text-[#7d8181] hover:text-[#D3764C]">
                    Mi Perfil
                </Link>

                <BotonCerrarSesion className="ml-4 text-[#7d8181] hover:text-[#D3764C]" />
            </div>
            
        </header>
    );
}