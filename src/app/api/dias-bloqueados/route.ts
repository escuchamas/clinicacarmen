import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { neon } from "@neondatabase/serverless";

function sql() {
  return neon(process.env.DATABASE_URL!);
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

async function ensureTable(db: ReturnType<typeof sql>) {
  await db`
    CREATE TABLE IF NOT EXISTS dias_bloqueados (
      id TEXT PRIMARY KEY,
      fecha DATE NOT NULL,
      hora_inicio TEXT,
      hora_fin TEXT,
      motivo TEXT,
      fecha_creacion TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  try { await db`ALTER TABLE dias_bloqueados ADD COLUMN IF NOT EXISTS hora_inicio TEXT`; } catch {}
  try { await db`ALTER TABLE dias_bloqueados ADD COLUMN IF NOT EXISTS hora_fin TEXT`; } catch {}
  try { await db`CREATE UNIQUE INDEX IF NOT EXISTS idx_bloqueos_dia ON dias_bloqueados (fecha) WHERE hora_inicio IS NULL`; } catch {}
  try { await db`ALTER TABLE dias_bloqueados DROP CONSTRAINT IF EXISTS dias_bloqueados_fecha_key`; } catch {}
}

// GET — lista de bloqueos (días completos y horas)
export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const db = sql();
    await ensureTable(db);
    const rows = await db`SELECT * FROM dias_bloqueados ORDER BY fecha ASC, hora_inicio ASC NULLS FIRST`;
    return NextResponse.json(rows.map(r => ({
      id: String(r.id),
      fecha: r.fecha instanceof Date ? r.fecha.toISOString().split("T")[0] : String(r.fecha).slice(0, 10),
      horaInicio: r.hora_inicio ? String(r.hora_inicio).slice(0, 5) : null,
      horaFin: r.hora_fin ? String(r.hora_fin).slice(0, 5) : null,
      motivo: r.motivo ? String(r.motivo) : "",
    })));
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al obtener bloqueos" }, { status: 500 });
  }
}

// POST — bloquear fecha o rango horario
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const { fecha, horaInicio, horaFin, motivo } = await req.json();
    if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      return NextResponse.json({ error: "Fecha inválida" }, { status: 400 });
    }

    const db = sql();
    await ensureTable(db);
    const id = generateId();

    if (horaInicio && horaFin) {
      // Bloqueo de horas concretas
      await db`
        INSERT INTO dias_bloqueados (id, fecha, hora_inicio, hora_fin, motivo)
        VALUES (${id}, ${fecha}, ${horaInicio}, ${horaFin}, ${motivo ?? ""})
      `;
    } else {
      // Bloqueo de día completo (único por fecha)
      await db`
        INSERT INTO dias_bloqueados (id, fecha, hora_inicio, hora_fin, motivo)
        VALUES (${id}, ${fecha}, NULL, NULL, ${motivo ?? ""})
        ON CONFLICT ON CONSTRAINT idx_bloqueos_dia DO UPDATE SET motivo = ${motivo ?? ""}
      `;
    }

    return NextResponse.json({ ok: true, id, fecha, horaInicio: horaInicio ?? null, horaFin: horaFin ?? null, motivo: motivo ?? "" }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al crear bloqueo" }, { status: 500 });
  }
}

// DELETE — eliminar bloqueo por id
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const body = await req.json();
    const db = sql();
    await ensureTable(db);

    if (body.id) {
      await db`DELETE FROM dias_bloqueados WHERE id = ${body.id}`;
    } else if (body.fecha) {
      // Compatibilidad: eliminar todos los bloqueos de una fecha
      await db`DELETE FROM dias_bloqueados WHERE fecha = ${body.fecha}`;
    } else {
      return NextResponse.json({ error: "Falta id o fecha" }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al eliminar bloqueo" }, { status: 500 });
  }
}
