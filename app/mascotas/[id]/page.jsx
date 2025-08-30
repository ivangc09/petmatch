import { notFound } from "next/navigation";
import ProfileShell from "./ProfileShell";

async function getMascota(id) {
	const base = process.env.API_BASE || process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
	const res = await fetch(`${base}/api/mascotas/detalles/${id}/`, { cache: "no-store" });
	if (res.status === 404) notFound();
	if (!res.ok) throw new Error(`Error ${res.status} al cargar mascota`);
	return res.json();
}

export default async function Page({ params: paramsPromise }) {
	const { id } = await paramsPromise;
	const mascota = await getMascota(id);
	return <ProfileShell mascota={mascota} idMascota={id} />;
}