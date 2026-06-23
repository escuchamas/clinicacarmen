import { NextRequest, NextResponse } from "next/server";
import { createLead } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nombre, telefono, email, motivo, fecha, franja } = body;

    if (!nombre?.trim() || !telefono?.trim()) {
      return NextResponse.json({ error: "Nombre y teléfono son obligatorios" }, { status: 400 });
    }

    const mensaje = [
      motivo?.trim(),
      fecha ? `Fecha preferida: ${fecha}` : null,
      franja && franja !== "indistinto" ? `Franja: ${franja}` : null,
    ].filter(Boolean).join(" · ");

    await createLead({
      nombre: nombre.trim(),
      telefono: telefono.trim(),
      email: email?.trim(),
      mensaje: mensaje || undefined,
      origen: "landing",
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    console.error("[reservar]", e);
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 });
  }
}
