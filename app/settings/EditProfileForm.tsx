"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";

// ─── Validation schema (client-side) ──────────────────────────────────────────

const schema = z.object({
  name:      z.string().max(50, "Max 50 characters"),
  bio:       z.string().max(160, "Max 160 characters"),
  username:  z
    .string()
    .min(3, "At least 3 characters")
    .max(30, "Max 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Letters, numbers, and underscores only"),
  avatarUrl: z.string().optional(),
  coverUrl:  z.string().optional(),
  twitter:   z.string().optional(),
  github:    z.string().optional(),
  linkedin:  z.string().optional(),
  website:   z.string().optional(),
});

// ─── Types ────────────────────────────────────────────────────────────────────

interface InitialData {
  name?:        string | null;
  bio?:         string | null;
  username:     string;
  avatarUrl?:   string | null;
  coverUrl?:    string | null;
  socialLinks?: Record<string, string>;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function EditProfileForm({ initialData }: { initialData: InitialData }) {
  const router = useRouter();

  const [form, setForm] = useState({
    name:      initialData.name      ?? "",
    bio:       initialData.bio       ?? "",
    username:  initialData.username  ?? "",
    avatarUrl: initialData.avatarUrl ?? "",
    coverUrl:  initialData.coverUrl  ?? "",
    twitter:   initialData.socialLinks?.twitter  ?? "",
    github:    initialData.socialLinks?.github   ?? "",
    linkedin:  initialData.socialLinks?.linkedin ?? "",
    website:   initialData.socialLinks?.website  ?? "",
  });

  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setSuccess(false);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues.map((i) => i.message).join(" · "));
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/users/me", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:      form.name      || undefined,
          bio:       form.bio       || undefined,
          username:  form.username  || undefined,
          avatarUrl: form.avatarUrl || undefined,
          coverUrl:  form.coverUrl  || undefined,
          socialLinks: {
            twitter:  form.twitter  || undefined,
            github:   form.github   || undefined,
            linkedin: form.linkedin || undefined,
            website:  form.website  || undefined,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Failed to save");
        return;
      }

      setSuccess(true);

      // Redirect to the new profile URL if the username changed
      if (data.username !== initialData.username) {
        router.push(`/${data.username}`);
      } else {
        router.refresh();
      }
    } catch {
      setError("Network error — please try again");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* ── Basic info ──────────────────────────────────────────────── */}
      <Card title="Basic Info">
        <Field label="Username" hint="3–30 chars · letters, numbers, underscores">
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            className={input}
            placeholder="your_username"
            autoComplete="username"
          />
        </Field>

        <Field label="Display name">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className={input}
            placeholder="Your Name"
            maxLength={50}
          />
        </Field>

        <Field label="Bio" hint="Max 160 characters">
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            className={`${input} resize-none`}
            placeholder="Tell people a bit about yourself…"
            rows={3}
            maxLength={160}
          />
          <p className="mt-1 text-right text-xs text-neutral-500">
            {form.bio.length}/160
          </p>
        </Field>
      </Card>

      {/* ── Images ──────────────────────────────────────────────────── */}
      <Card title="Images">
        <p className="text-xs text-neutral-500">
          Paste an image URL for now. Drag-and-drop upload comes with R2 storage in a later update.
        </p>

        <Field label="Avatar URL">
          <input
            name="avatarUrl"
            value={form.avatarUrl}
            onChange={handleChange}
            className={input}
            placeholder="https://example.com/avatar.jpg"
            type="url"
          />
        </Field>

        <Field label="Cover image URL">
          <input
            name="coverUrl"
            value={form.coverUrl}
            onChange={handleChange}
            className={input}
            placeholder="https://example.com/cover.jpg"
            type="url"
          />
        </Field>
      </Card>

      {/* ── Social links ────────────────────────────────────────────── */}
      <Card title="Social Links">
        {([
          { name: "twitter",  label: "Twitter / X",      placeholder: "https://twitter.com/handle" },
          { name: "github",   label: "GitHub",            placeholder: "https://github.com/username" },
          { name: "linkedin", label: "LinkedIn",          placeholder: "https://linkedin.com/in/name" },
          { name: "website",  label: "Personal website",  placeholder: "https://yoursite.com" },
        ] as const).map((f) => (
          <Field key={f.name} label={f.label}>
            <input
              name={f.name}
              value={form[f.name]}
              onChange={handleChange}
              className={input}
              placeholder={f.placeholder}
              type="url"
            />
          </Field>
        ))}
      </Card>

      {/* ── Submit ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>

        {success && (
          <p className="text-sm text-green-400">Saved successfully!</p>
        )}
        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}
      </div>
    </form>
  );
}

// ─── Small layout helpers ─────────────────────────────────────────────────────

const input =
  "w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-5 rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
      <h2 className="text-base font-semibold text-white">{title}</h2>
      {children}
    </section>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-neutral-300">{label}</label>
      {hint && <p className="text-xs text-neutral-500">{hint}</p>}
      {children}
    </div>
  );
}
