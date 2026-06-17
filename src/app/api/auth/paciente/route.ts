import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getPacienteByEmailForPortal, setPacientePassword, createPacientePortal } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action, nombre, email, password } = body;

  if (!email?.trim() || !password?.trim()) {
    return NextResponse.json({ error: "Email y contraseña son obligatorios" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 });
  }

  const hash = await bcrypt.hash(password, 10);

  if (action === "register") {
    if (!nombre?.trim()) return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });

    const existing = await getPacienteByEmailForPortal(email.trim());
    if (existing) {
      // Link portal access to existing patient record
      await setPacientePassword(existing.id, hash);
      return NextResponse.json({ ok: true, linked: true });
    }
    // Create new patient record
    await createPacientePortal(nombre.trim(), email.trim(), hash);
    return NextResponse.json({ ok: true, linked: false }, { status: 201 });
  }

  return NextResponse.json({ error: "Acción desconocida" }, { status: 400 });
}
