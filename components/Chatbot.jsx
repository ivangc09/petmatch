import { useState } from "react";
import ChatWidget from "@/components/ChatWidget";

export default function Page() {
	const [loading, setLoading] = useState(false);
	const [messages, setMessages] = useState([]);

	const EXCEPTIONS = {
	"Maine_Coon": "Maine Coon",
	"keeshond": "Keeshond",
	"basset_hound": "Basset Hound",
	"samoyed": "Samoyedo",
	"boxer": "Bóxer",
	"german_shorthaired": "Braco Alemán de Pelo Corto",
	"leonberger": "Leonberger",
	"american_bulldog": "Bulldog Americano",
	"Persian": "Persa",
	"Bombay": "Bombay",
	"wheaten_terrier": "Wheaten Terrier",
	"Bengal": "Bengalí",
	"pug": "Pug (Carlino)",
	"shiba_inu": "Shiba Inu",
	"Sphynx": "Sphynx (Esfinge)",
	"japanese_chin": "Chin Japonés",
	"chihuahua": "Chihuahua",
	"american_pit_bull_terrier": "Pit Bull Terrier Americano",
	"miniature_pinscher": "Pinscher Miniatura",
	"english_cocker_spaniel": "Cocker Spaniel Inglés",
	"British_Shorthair": "Británico de Pelo Corto",
	"english_setter": "Setter Inglés",
	"great_pyrenees": "Perro de Montaña de los Pirineos",
	"staffordshire_bull_terrier": "Staffordshire Bull Terrier",
	"pomeranian": "Pomerania",
	"Siamese": "Siamés",
	"saint_bernard": "San Bernardo",
	"newfoundland": "Terranova",
	"yorkshire_terrier": "Yorkshire Terrier",
	"scottish_terrier": "Terrier Escocés",
	"Ragdoll": "Ragdoll",
	"Russian_Blue": "Azul Ruso",
	"Abyssinian": "Abisinio",
	"beagle": "Beagle",
	"havanese": "Bichón Habanero",
	"Egyptian_Mau": "Mau Egipcio",
	"Birman": "Sagrado de Birmania",
	"golden_retriever": "Golden Retriever",
	"french_bulldog": "Bulldog Francés",
	"siberian_husky": "Husky Siberiano",
	"poodle": "Caniche (Poodle)",
	"doberman": "Dóberman",
	"dachshund": "Teckel (Dachshund)",
	"border_collie": "Border Collie",
	"australian_shepherd": "Pastor Australiano",
	"rottweiler": "Rottweiler",
	"pitbull": "Pitbull",
	"scottish_fold": "Scottish Fold",
	"norwegian_forest_cat": "Bosque de Noruega",
	"himalayan": "Himalayo",
	"american_shorthair": "Americano de Pelo Corto",
	"turkish_angora": "Angora Turco",
	"chartreux": "Chartreux (Cartujo)",
	"cornish_rex": "Cornish Rex"
	};


	const CLASSIFIER_URL ="https://clasificadormascotas-production.up.railway.app/clasificar/";
	const CHATBOT_URL = "https://chatbot-production-38c5.up.railway.app/api/chatbot/";

	async function sendMsg(msg) {
		// Agregar mensaje del usuario
		setMessages((prev) => [
			...prev,
			{ id: crypto.randomUUID(), role: "user", text: msg, ts: Date.now() },
		]);
		setLoading(true);

		try {
			const res = await fetch(
				CHATBOT_URL,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ mensaje: msg }),
				}
			);	
			const data = await res.json();
	
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

	async function handleImage(file) {
		setMessages((prev) => [
			...prev,
			{ id: crypto.randomUUID(), role: "user", text: "Subí una foto de mi mascota", ts: Date.now() },
			{ id: crypto.randomUUID(), role: "bot", text: "Analizando la imagen para reconocer la raza…", ts: Date.now() },
		]);
		setLoading(true);

		try{
			const fd = new FormData();
			fd.append("file", file, file.name);

			const clfRes = await fetch(CLASSIFIER_URL, { method: "POST", body: fd });
			const clfData = await clfRes.json();

      		// 2) Resolver el nombre de la raza con tolerancia a diferentes payloads
			const breed =
				clfData?.breed ||
				clfData?.raza ||
				clfData?.label ||
				clfData?.predicted_breed ||
				clfData?.prediction ||
				(Array.isArray(clfData?.predictions) ? clfData.predictions[0] : null);

			if (!breed || typeof breed !== "string") {
				setMessages((prev) => [
					...prev,
					{ id: crypto.randomUUID(), role: "bot", text: "No pude reconocer la raza en la imagen. ¿Puedes intentar con otra foto más nítida?", ts: Date.now() },
				]);
				return;
			}
		
			const breedName = breed.trim();
			const pretty = EXCEPTIONS[breedName]
		
      		// Mostrar la raza detectada
			setMessages((prev) => [
				...prev,
			  	{ id: crypto.randomUUID(), role: "bot", text: `Parece que este amiguito es un **${pretty}**.`, ts: Date.now() },
			]);
		
      		// 3) Llamar chatbot con “info_general: RAZA”
			const prompt = `info_general: ${breedName}`;
			const chatRes = await fetch(CHATBOT_URL, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ mensaje: prompt }),
			});

			const chatData = await chatRes.json();
		
			let botText = "";
			if (typeof chatData?.respuesta === "string") botText = chatData.respuesta;
			else if (Array.isArray(chatData?.respuestas)) botText = chatData.respuestas[0]?.respuesta || chatData.respuestas[0] || "No encontré respuesta.";
			else botText = chatData?.answer || chatData?.message || "No pude entender la respuesta del servidor.";

			setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "bot", text: botText, ts: Date.now() }]);
		} catch (err) {
			setMessages((prev) => [
				...prev,
				{ id: crypto.randomUUID(), role: "bot", text: "Ocurrió un error procesando la imagen o consultando el chatbot.", ts: Date.now() },
			]);
		} finally{
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
			onImage={handleImage}
		/>
	);
}
