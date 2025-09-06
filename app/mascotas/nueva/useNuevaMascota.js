"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/FeedBack";

export function useNuevaMascota() {
    const router = useRouter();
    const { show } = useToast();
    const [formData, setFormData] = useState({
        nombre: "",
        especie: "perro",
        raza: "",
        edad: "",
        tamaño: "mediano",
        sexo: "macho",
        descripcion: "",
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
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleImageChange = (e) => {
        setImagen(e.target.files[0]);
    };

    const handleDetectarRaza = async () => {
        if (!imagen) {
            setError(show({ title: "Error", message: "Por favor, selecciona una imagen primero.", variant: "danger" }));
            return;
        }
        setCargandoRaza(true);
        setError(null);

        try {
            const data = new FormData();
            data.append("file", imagen);

            const res = await fetch("https://clasificadormascotas-production.up.railway.app/clasificar", {
                method: "POST",
                body: data,
            });

            if (!res.ok) throw new Error("Error al clasificar la imagen");

            const result = await res.json();
            const razaPredicha = result.raza || result.prediccion || "";

            setFormData((prev) => ({
                ...prev,
                raza: razaPredicha,
            }));
        } catch (err) {
            setError(show({ title: "Error", message: err.message || "Error al detectar la raza", variant: "danger" }));
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

        const response = await fetch("http://localhost:8000/api/mascotas/crear/", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: data,
        });

        if (response.ok) {
            show({ title: "Éxito", message: "Mascota registrada correctamente", variant: "success" });
            router.push("/veterinario");
        } else {
            const errorData = await response.json();
            setError(show({ title: "Error", message: errorData.detail, variant: "danger" }));
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
