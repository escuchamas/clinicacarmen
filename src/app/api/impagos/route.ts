import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { neon } from "@neondatabase/serverless";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const db = neon(process.env.DATABASE_URL!);
    const rows = await db`
      SELECT COUNT(*)::int AS total
      FROM citas
      WHERE estado = 'vino'
        AND (pago_estado = 'sin_pagar' OR pago_estado IS NULL)
    `;
    const total = Number(rows[0]?.total ?? 0);
    return NextResponse.json({ total });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ total: 0 });
  }
}
