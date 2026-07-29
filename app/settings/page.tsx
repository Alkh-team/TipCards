import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EditProfileForm } from "./EditProfileForm";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name:        true,
      bio:         true,
      username:    true,
      avatarUrl:   true,
      coverUrl:    true,
      socialLinks: true,
      plan:        true,
      email:       true,
    },
  });

  if (!user) redirect("/auth/login");

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Account Settings</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Update your public profile.{" "}
          <span
            className={`font-medium ${
              user.plan === "FREE" ? "text-neutral-300" : "text-indigo-400"
            }`}
          >
            {user.plan} plan
          </span>
          {user.plan === "FREE" && (
            <>
              {" · "}
              <a href="/pricing" className="text-indigo-400 hover:underline">
                Upgrade to Creator
              </a>
            </>
          )}
        </p>
      </div>

      <EditProfileForm
        initialData={{
          ...user,
          socialLinks: (user.socialLinks ?? {}) as Record<string, string>,
        }}
      />
    </div>
  );
}
