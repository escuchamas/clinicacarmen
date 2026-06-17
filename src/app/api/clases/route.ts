import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getClasesPilates, getClasesPilatesByMes, createClasePilates } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
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
  const user = session?.user as { role?: string } | undefined;
  if (user?.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { titulo, fecha, horaInicio, horaFin, capacidad, notas } = body;
  if (!titulo || !fecha || !horaInicio || !horaFin) {
    return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
  }
  const clase = await createClasePilates({ titulo, fecha, horaInicio, horaFin, capacidad: Number(capacidad) || 8, notas });
  return NextResponse.json(clase, { status: 201 });
}
