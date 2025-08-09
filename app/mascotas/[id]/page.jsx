import PetProfile from "./profile-client";

async function getMascota(id) {
  const base = "http://localhost:8000";

  const url = new URL(`/api/mascotas/detalles/${id}/`, base).toString();

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Error ${res.status} al cargar mascota`);
  return res.json();
}

export default async function Page({ params }) {
    const { id } = await params;
    const mascota = await getMascota(id);
    return <PetProfile mascota={mascota} />;
}