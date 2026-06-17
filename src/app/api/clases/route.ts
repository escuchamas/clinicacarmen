import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { neon } from "@neondatabase/serverless";
import { getClasesPilates, getClasesPilatesByMes, createClasePilates } from "@/lib/db";

async function ensureClasesTable() {
  const db = neon(process.env.DATABASE_URL!);
  await db`
    CREATE TABLE IF NOT EXISTS clases_pilates (
      id TEXT PRIMARY KEY,
      titulo TEXT NOT NULL,
      fecha DATE NOT NULL,
      hora_inicio TEXT NOT NULL,
      hora_fin TEXT NOT NULL,
      capacidad INTEGER DEFAULT 8,
      notas TEXT DEFAULT '',
      estado TEXT DEFAULT 'activa',
      fecha_creacion TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await db`
    CREATE TABLE IF NOT EXISTS inscripciones_pilates (
      id TEXT PRIMARY KEY,
      clase_id TEXT REFERENCES clases_pilates(id) ON DELETE CASCADE,
      paciente_id TEXT,
      estado TEXT DEFAULT 'inscrita',
      fecha_inscripcion TIMESTAMPTZ DEFAULT NOW(),
      fecha_cancelacion TIMESTAMPTZ
    )
  `;
}

export async function GET(req: NextRequest) {
  try {
    await ensureClasesTable();
    const { searchParams } = req.nextUrl;
    const year = searchParams.get("year");
    const month = searchParams.get("month");
    if (year && month) {
      const clases = await getClasesPilatesByMes(Number(year), Number(month));
      return NextResponse.json(clases);
    }
    const clases = await getClasesPilates();
    return NextResponse.json(clases);
  } catch (e) {
    console.error(e);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const { titulo, fecha, horaInicio, horaFin, capacidad, notas } = body;
  if (!titulo || !fecha || !horaInicio || !horaFin) {
    return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
  }
  const clase = await createClasePilates({ titulo, fecha, horaInicio, horaFin, capacidad: Number(capacidad) || 8, notas });
  return NextResponse.json(clase, { status: 201 });
}
