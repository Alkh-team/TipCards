"use client";

import { useState } from "react";

export function ManageBillingButton() {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data: { url?: string; error?: string } = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="inline-flex items-center gap-1 rounded-lg border border-neutral-700 px-5 py-2 text-sm font-semibold text-neutral-300 transition-colors hover:bg-neutral-800 disabled:opacity-60"
    >
      {loading ? "Redirecting…" : "Manage Billing →"}
    </button>
  );
}
