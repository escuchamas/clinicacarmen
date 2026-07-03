import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getBlogPostById, updateBlogPost, deleteBlogPost, getBlogPosts } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const post = await getBlogPostById(id);
  if (!post) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json(post);
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const data = await req.json();
  await updateBlogPost(id, data);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  await deleteBlogPost(id);
  return NextResponse.json({ ok: true });
}

// Admin: list ALL posts (including drafts)
export async function PATCH() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const posts = await getBlogPosts(false);
  return NextResponse.json(posts);
}
