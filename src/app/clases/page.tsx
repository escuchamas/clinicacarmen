import { getClasesPilates } from "@/lib/db";
import ClasesClient from "./ClasesClient";

export default async function ClasesPage() {
  const clases = await getClasesPilates();
  const proximas = clases.filter(c => c.estado === "activa");
  return <ClasesClient clases={proximas} />;
}
