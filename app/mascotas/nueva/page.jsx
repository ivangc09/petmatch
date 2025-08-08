"use client";

import NuevaMascotaForm from "./NuevaMascotaForm";
import { useNuevaMascota } from "./useNuevaMascota";

export default function NuevaMascotaPage() {
    const mascotaHook = useNuevaMascota();
    return <NuevaMascotaForm {...mascotaHook} />;
}
