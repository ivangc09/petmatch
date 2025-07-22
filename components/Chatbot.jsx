"use client"

import { useState } from "react"

export default function Chatbot(){
    const [mensaje, setMensaje] = useState("");
    const [historial, setHistorial] = useState([]);
    const [cargando, setCargando] = useState(false);

    const enviarPregunta =  async () =>{
        if (!mensaje.trim()) return;

        const preguntaUsuario = mensaje;
        setHistorial([...historial,{autor:"Usuario", mensaje: preguntaUsuario}]);
        setMensaje("");
        setCargando(true);

        // !Cambiar la ruta a la API real
        try{
            const response = await fetch("ruta-a-la-api",{
                method: "POST",
                headers:{
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ pregunta: preguntaUsuario })
            });

            const data = await response.json();
            const respuesta = data.respuesta || "Lo siento, no tengo una respuesta para eso.";

            setHistorial((prev) => [
                ...prev,
                { autor : "Bot", mensaje: respuesta }
            ]);
        }
        catch(error){
            setHistorial((prev) => [
                ...prev,
                { autor: "Bot", mensaje: "Error al obtener respuesta del bot." }
            ]);
        }
        finally{
            setCargando(false);
        }
    };

    // * HTML provsional para el chatbot

    return(
        <div className="max-w-xl mx-auto p-4">
            <h2 className="text-xl font-bold mb-4">Chatbot de Mascotas</h2>

            <div className="bg-gray-100 p-4 rounded h-80 overflow-y-auto mb-4">
                {historial.map((msg, index) => (
                    <div key={index} className={`mb-2 ${msg.autor === 'usuario' ? 'text-right' : 'text-left'}`}>
                        <span className={`inline-block px-3 py-2 rounded-lg ${msg.autor === 'usuario' ? 'bg-blue-500 text-white' : 'bg-white text-black border'}`}>
                            {msg.texto}
                        </span>
                    </div>
                ))}
                {cargando && <p className="text-sm text-gray-500">Pensando...</p>}
            </div>

            <div className="flex gap-2">
                <input
                    type="text"
                    className="flex-1 p-2 border rounded"
                    placeholder="Escribe tu pregunta..."
                    value={mensaje}
                    onChange={(e) => setMensaje(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && enviarPregunta()}
                />
                <button
                    onClick={enviarPregunta}
                    className="bg-green-600 text-white px-4 py-2 rounded"
                >
                    Enviar
                </button>
            </div>
        </div>
    );
}