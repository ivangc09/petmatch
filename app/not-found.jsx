export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#fff6f1] to-[#fdeee7] text-center">
            <h1 className="text-6xl font-bold text-[#d47451] mb-4">404</h1>
            <p className="text-lg text-[#2b3136] mb-6">
                Oops, la página que buscas no existe
            </p>
            <a
                href="/dashboard"
                className="px-6 py-3 bg-[#7d9a75] text-white rounded-xl shadow hover:bg-[#607859] transition"
                >
                    Volver al inicio
            </a>
            <div>
                <img
                    src="/not-found/not-found.png"
                    alt="not-found"
                />
            </div>
            
        </div>
    );
}