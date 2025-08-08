export default function BotonCerrarSesion() {
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        window.location.href = '/login';
    };

    return (
        <button
            onClick={handleLogout}
            className="bg-[#D3764C] text-white px-4 py-2 rounded-md hover:bg-[#e0795e] transition-colors"
        >
            Cerrar Sesión
        </button>
    );
}