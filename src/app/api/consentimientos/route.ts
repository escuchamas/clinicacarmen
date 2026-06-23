import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getConsentimientos, createConsentimiento } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const docs = await getConsentimientos();
    return NextResponse.json(docs);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al obtener consentimientos" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const { nombre, url } = await req.json();
    if (!nombre?.trim() || !url?.trim()) {
      return NextResponse.json({ error: "Nombre y URL son obligatorios" }, { status: 400 });
    }
    const doc = await createConsentimiento(nombre.trim(), url.trim());
    return NextResponse.json(doc);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al guardar el consentimiento" }, { status: 500 });
  }
}
