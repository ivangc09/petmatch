"use client";

import { useEffect, useState } from "react";
import PetProfile from "./profile-client";
import VetPetProfile from "./vetprofile-cliente";

export default function ProfileShell({ mascota }) {
  const [tipoUsuario, setTipoUsuario] = useState(null);

  useEffect(() => {
    try {
      setTipoUsuario(localStorage.getItem("tipo_usuario"));
    } catch {}
  }, []);

  if (tipoUsuario === "veterinario") {
    return <VetPetProfile mascota={mascota} />;
  }
  return <PetProfile mascota={mascota} />;
}
