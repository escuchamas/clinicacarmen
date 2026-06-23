import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateLeadEstado, LeadEstado } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const { id } = await params;
    const { estado } = await req.json();
    await updateLeadEstado(id, estado as LeadEstado);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
