import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getLeads } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    return NextResponse.json(await getLeads());
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
