import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const pacienteId = formData.get("pacienteId") as string | null;

    if (!file || !pacienteId) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Formato no permitido. Usa JPG, PNG, WebP o PDF." }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "El archivo supera el límite de 10 MB." }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const fileName = `prueba_${Date.now()}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", pacienteId);

    await mkdir(uploadDir, { recursive: true });
    const bytes = await file.arrayBuffer();
    await writeFile(path.join(uploadDir, fileName), Buffer.from(bytes));

    return NextResponse.json({ url: `/uploads/${pacienteId}/${fileName}` });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al subir el archivo" }, { status: 500 });
  }
}
