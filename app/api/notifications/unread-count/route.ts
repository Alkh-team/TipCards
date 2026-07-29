import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** GET /api/notifications/unread-count — returns { count } for the bell badge. */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ count: 0 });

  const count = await prisma.notification.count({
    where: { userId: session.user.id, read: false },
  });

  return NextResponse.json({ count });
}
