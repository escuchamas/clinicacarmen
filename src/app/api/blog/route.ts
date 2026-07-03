import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getBlogPosts, createBlogPost } from "@/lib/db";

// Público: solo publicados. Admin autenticado: todos.
export async function GET() {
  try {
    const session = await auth();
    const posts = await getBlogPosts(!session);
    return NextResponse.json(posts);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const data = await req.json();
    if (!data.titulo?.trim() || !data.slug?.trim() || !data.contenido?.trim()) {
      return NextResponse.json({ error: "Título, slug y contenido son obligatorios" }, { status: 400 });
    }
    const post = await createBlogPost(data);
    return NextResponse.json(post, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al crear post" }, { status: 500 });
  }
}
