import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { UserAvatar } from "@/components/profile/UserAvatar";
import type { NotificationType } from "@prisma/client";

export const metadata = { title: "Notifications · CodeTip" };

function notificationText(type: NotificationType, actorName: string): string {
  switch (type) {
    case "FOLLOW":  return `${actorName} started following you`;
    case "LIKE":    return `${actorName} liked your card`;
    case "COMMENT": return `${actorName} commented on your card`;
    default:        return "You have a new notification";
  }
}

function timeAgo(date: Date | string): string {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60)          return "just now";
  const m = Math.floor(s / 60);
  if (m < 60)          return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)          return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30)          return `${d}d ago`;
  return new Date(date).toLocaleDateString();
}

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  // Fetch and mark-as-read concurrently
  const [notifications] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        type: true,
        read: true,
        postId: true,
        createdAt: true,
        actor: {
          select: { id: true, username: true, name: true, avatarUrl: true },
        },
        post: { select: { id: true, title: true } },
      },
    }),
    prisma.notification.updateMany({
      where: { userId: session.user.id, read: false },
      data: { read: true },
    }),
  ]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-white">Notifications</h1>

      {notifications.length === 0 ? (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 px-6 py-16 text-center">
          <p className="text-neutral-400">No notifications yet.</p>
          <p className="mt-1 text-sm text-neutral-600">
            Follow creators or publish cards to get started.
          </p>
        </div>
      ) : (
        <ul className="space-y-0.5">
          {notifications.map((n) => {
            const actorName = n.actor.name ?? `@${n.actor.username}`;
            const text = notificationText(n.type, actorName);
            const href = n.post ? `/posts/${n.post.id}` : `/${n.actor.username}`;

            return (
              <li key={n.id}>
                <Link
                  href={href}
                  className={`flex items-start gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-neutral-800/60 ${
                    !n.read ? "bg-neutral-900/80 ring-1 ring-inset ring-indigo-500/20" : ""
                  }`}
                >
                  <UserAvatar
                    name={n.actor.name ?? n.actor.username}
                    avatarUrl={n.actor.avatarUrl}
                    size={38}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-snug text-neutral-200">
                      <span className="font-medium text-white">{actorName}</span>
                      {" "}
                      {n.type === "FOLLOW" && "started following you"}
                      {n.type === "LIKE" && "liked your card"}
                      {n.type === "COMMENT" && "commented on your card"}
                      {n.post && (
                        <span className="text-neutral-400">
                          {" "}— &ldquo;{n.post.title}&rdquo;
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 text-xs text-neutral-500">
                      {timeAgo(n.createdAt)}
                    </p>
                  </div>
                  {!n.read && (
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
