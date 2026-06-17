import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getClasePilatesById, getInscripcionesByClase, updateClasePilates, deleteClasePilates } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const clase = await getClasePilatesById(id);
  if (!clase) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const inscritos = await getInscripcionesByClase(id);
  return NextResponse.json({ ...clase, inscritos });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const user = session?.user as { role?: string } | undefined;
  if (user?.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  await updateClasePilates(id, body);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const user = session?.user as { role?: string } | undefined;
  if (user?.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await deleteClasePilates(id);
  return NextResponse.json({ ok: true });
}
