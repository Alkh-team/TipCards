"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface Props {
  className?: string;
  label?: string;
}

export function UpgradeButton({ className, label = "Upgrade to Creator" }: Props) {
  const [loading, setLoading] = useState(false);
  const { status } = useSession();
  const router = useRouter();

  async function handleUpgrade() {
    if (status !== "authenticated") {
      router.push("/auth/login?callbackUrl=/pricing");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data: { url?: string; error?: string } = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button onClick={handleUpgrade} disabled={loading} className={className}>
      {loading ? "Redirecting…" : label}
    </button>
  );
}
