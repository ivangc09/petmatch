import { useState } from "react";
import ChatWidget from "@/components/ChatWidget";

export default function Page() {
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);

  async function sendMsg(msg) {
    // Agregar mensaje del usuario
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", text: msg, ts: Date.now() },
    ]);
    setLoading(true);

    try {
      const res = await fetch(
        "https://chatbot-production-38c5.up.railway.app/api/chatbot/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" }, // ← importante
          body: JSON.stringify({ mensaje: msg }), // ← aquí el campo correcto
        }
      );

      const data = await res.json();
      console.log("API data:", data);

      // Resolver texto de la respuesta
      let botText = "";
      if (typeof data?.respuesta === "string") {
        botText = data.respuesta;
      } else if (Array.isArray(data?.respuestas)) {
        botText =
          data.respuestas[0]?.respuesta ||
          data.respuestas[0] ||
          "No encontré respuesta.";
      } else {
        botText =
          data?.answer ||
          data?.message ||
          "No pude entender la respuesta del servidor.";
      }

      // Agregar mensaje del bot
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "bot", text: botText, ts: Date.now() },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "bot",
          text: "Error al conectar con el servidor.",
          ts: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ChatWidget
      brand="PawBot"
      subtitle="Asistente"
      loading={loading}
      messages={messages}
      onSend={sendMsg}
    />
  );
}
