import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/posts/[id]/save
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: postId } = await params;

  await prisma.save.upsert({
    where:  { userId_postId: { userId: session.user.id, postId } },
    create: { userId: session.user.id, postId },
    update: {},
  });

  return NextResponse.json({ saved: true });
}

// DELETE /api/posts/[id]/save
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: postId } = await params;

  await prisma.save.deleteMany({
    where: { userId: session.user.id, postId },
  });

  return NextResponse.json({ saved: false });
}
