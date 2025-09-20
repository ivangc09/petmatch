import FormularioAdopcion from "@/components/FormularioAdopcion"
import AdoptanteHeader from "@/components/AdoptanteHeader"

export default function Adopcion({ searchParams }){
    const petId = searchParams?.petId ?? null;
    const step = searchParams?.step ?? "1";

    return (
        <div>
            <AdoptanteHeader />
            <FormularioAdopcion petId={petId} step={step} />
        </div>
    );
}