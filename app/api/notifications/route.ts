import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 20;

/** GET /api/notifications?cursor= — paginated notifications for the current user. */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cursor = new URL(req.url).searchParams.get("cursor") ?? undefined;

  const rows = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: {
      id: true,
      type: true,
      read: true,
      postId: true,
      createdAt: true,
      actor: {
        select: { id: true, username: true, name: true, avatarUrl: true },
      },
      post: {
        select: { id: true, title: true },
      },
    },
  });

  const hasMore = rows.length > PAGE_SIZE;
  const slice = hasMore ? rows.slice(0, PAGE_SIZE) : rows;
  const nextCursor = hasMore ? slice[slice.length - 1].id : null;

  return NextResponse.json({ notifications: slice, nextCursor });
}
