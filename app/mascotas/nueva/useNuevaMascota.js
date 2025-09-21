"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/FeedBack";

export function useNuevaMascota() {
    const router = useRouter();
    const { show } = useToast();
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

    const EXCEPTIONS = {
        "Maine_Coon": "Maine Coon","keeshond": "Keeshond","basset_hound": "Basset Hound","samoyed": "Samoyedo","boxer": "Bóxer",
        "german_shorthaired": "Braco Alemán de Pelo Corto", "leonberger": "Leonberger", "american_bulldog": "Bulldog Americano", "Persian": "Persa", "Bombay": "Bombay", "wheaten_terrier": "Wheaten Terrier", "Bengal": "Bengalí", "pug": "Pug (Carlino)",
        "shiba_inu": "Shiba Inu", "Sphynx": "Sphynx (Esfinge)", "japanese_chin": "Chin Japonés", "chihuahua": "Chihuahua", "american_pit_bull_terrier": "Pit Bull Terrier Americano", "miniature_pinscher": "Pinscher Miniatura", "english_cocker_spaniel": "Cocker Spaniel Inglés",
        "British_Shorthair": "Británico de Pelo Corto", "english_setter": "Setter Inglés", "great_pyrenees": "Perro de Montaña de los Pirineos", "staffordshire_bull_terrier": "Staffordshire Bull Terrier", "pomeranian": "Pomerania", "Siamese": "Siamés", "saint_bernard": "San Bernardo",
        "newfoundland": "Terranova", "yorkshire_terrier": "Yorkshire Terrier", "scottish_terrier": "Terrier Escocés", "Ragdoll": "Ragdoll", "Russian_Blue": "Azul Ruso", "Abyssinian": "Abisinio", "beagle": "Beagle",
        "havanese": "Bichón Habanero", "Egyptian_Mau": "Mau Egipcio", "Birman": "Sagrado de Birmania", "golden_retriever": "Golden Retriever", "french_bulldog": "Bulldog Francés", "siberian_husky": "Husky Siberiano", "poodle": "Caniche (Poodle)",
        "doberman": "Dóberman","dachshund": "Teckel (Dachshund)","border_collie": "Border Collie","australian_shepherd": "Pastor Australiano","rottweiler": "Rottweiler","pitbull": "Pitbull","scottish_fold": "Scottish Fold",
        "norwegian_forest_cat": "Bosque de Noruega","himalayan": "Himalayo","american_shorthair": "Americano de Pelo Corto","turkish_angora": "Angora Turco","chartreux": "Chartreux (Cartujo)","cornish_rex": "Cornish Rex"
    };

    const prettyBreed = (raw = "") => {
        if (!raw) return "";
        if (EXCEPTIONS[raw]) return EXCEPTIONS[raw];

      // Normaliza strings"
        const normalized = String(raw)
            .replace(/_/g, " ")
            .trim()
            .replace(/\s+/g, " ")
            .toLowerCase()
            .replace(/(^|\s)\S/g, (m) => m.toUpperCase());

        return normalized;
    };

    const [formData, setFormData] = useState({
        nombre: "",
        especie: "perro",
        raza: "",
        edad: "",
        tamaño: "mediano",
        sexo: "macho",
        descripcion: "",
        es_jugueton: false,
        es_tranquilo: true,
        convive_otras_mascotas: true,
        convive_ninos: true,
        nivel_energia: "medio",
    });

    const [imagen, setImagen] = useState(null);
    const [error, setError] = useState(null);
    const [tipoUsuario, setTipoUsuario] = useState("");
    const [cargandoRaza, setCargandoRaza] = useState(false);

    useEffect(() => {
        const tipo = localStorage.getItem("tipo_usuario");
        const token = localStorage.getItem("token");
        if (tipo && token) {
            setTipoUsuario(tipo);
        } else {
            router.push("/login");
        }
    }, [router]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        setFormData((prev) => {
            if (name === "jugueton") {
                const esJugueton = value === "Si";
                return {
                    ...prev,
                    es_jugueton: esJugueton,
                    es_tranquilo: !esJugueton,
                };
            }

                if (name === "conviveNinos") {
                    return { ...prev, convive_ninos: value === "Si" };
                }
            
                if (name === "conviveOtrasMascotas") {
                    return { ...prev, convive_otras_mascotas: value === "Si" };
                }
            
                if (name === "nivelEnergia") {
                    return { ...prev, nivel_energia: value.toLowerCase() };
                }
            
            // Para el resto, asignación directa
            return { ...prev, [name]: value };
        });
    };

    const handleImageChange = (e) => {
        setImagen(e.target.files?.[0] || null);
    };

    const handleDetectarRaza = async () => {
        if (!imagen) {
            setError(
                show({
                    title: "Error",
                    message: "Por favor, selecciona una imagen primero.",
                    variant: "danger",
                })
            );
            return;
        }
        setCargandoRaza(true);
        setError(null);

            try {
                const data = new FormData();
                data.append("file", imagen);

                const res = await fetch(
                "https://clasificadormascotas-production.up.railway.app/clasificar/",
                { method: "POST", body: data }
                );

                if (!res.ok) throw new Error("Error al clasificar la imagen");

                const result = await res.json();
                const raw = result.raza || result.prediccion || "";

                const bonito = prettyBreed(raw);

                setFormData((prev) => ({
                    ...prev,
                    raza: bonito,
                }));
            } catch (err) {
                setError(
                    show({
                        title: "Error",
                        message: err.message || "Error al detectar la raza",
                        variant: "danger",
                    })
                );
            } finally {
                setCargandoRaza(false);
            }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        
        const data = new FormData();
        for (const key in formData) {
            data.append(key, formData[key]);
        }
        if (imagen) {
            data.append("fotos", imagen);
        }

        const response = await fetch(`${API_BASE}/api/mascotas/crear/`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: data,
        });

        if (response.ok) {
            show({
                title: "Éxito",
                message: "Mascota registrada correctamente",
                variant: "success",
            });
            router.push("/veterinario");
        } else {
            let message = "Error al registrar";
            try {
                const errorData = await response.json();
                message = errorData?.detail || errorData?.error || message;
            } catch {}
            setError(show({ title: "Error", message, variant: "danger" }));
        }
    };

    return {
        formData,
        imagen,
        error,
        tipoUsuario,
        cargandoRaza,
        handleChange,
        handleImageChange,
        handleDetectarRaza,
        handleSubmit,
    };
}
