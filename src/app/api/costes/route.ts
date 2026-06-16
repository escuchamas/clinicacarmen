import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCostes, createCoste, deleteCoste, getIngresosPorCitas } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const year = parseInt(searchParams.get("year") ?? String(new Date().getFullYear()));
    const month = parseInt(searchParams.get("month") ?? String(new Date().getMonth() + 1));
    const [costes, ingresos] = await Promise.all([
      getCostes(year, month),
      getIngresosPorCitas(year, month),
    ]);
    return NextResponse.json({ costes, ingresos });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al obtener datos" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const body = await req.json();
    if (body.action === "delete") {
      await deleteCoste(body.id);
      return NextResponse.json({ ok: true });
    }
    const coste = await createCoste({
      fecha: body.fecha,
      concepto: body.concepto,
      importe: parseFloat(body.importe),
      categoria: body.categoria ?? "otro",
      notas: body.notas ?? "",
    });
    return NextResponse.json(coste, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al procesar" }, { status: 500 });
  }
}
