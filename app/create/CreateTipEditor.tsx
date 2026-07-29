"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { TipCardContent, LayoutType, ContentItem } from "@/types";
import { LayoutPicker }   from "@/components/editor/LayoutPicker";
import { ContentBlocks }  from "@/components/editor/ContentBlocks";
import { ColorPicker }    from "@/components/editor/ColorPicker";
import { TipCardPreview } from "@/components/editor/TipCardPreview";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mkItem(type: ContentItem["type"]): ContentItem {
  return { id: crypto.randomUUID(), type, content: "", language: "typescript" };
}

function defaultItems(layout: LayoutType): ContentItem[] {
  switch (layout) {
    case "bullet-list":  return [mkItem("bullet"), mkItem("bullet"), mkItem("bullet")];
    case "do-dont":      return [mkItem("do"), mkItem("do"), mkItem("dont"), mkItem("dont")];
    case "before-after": return [mkItem("before"), mkItem("after")];
    case "quote":        return [mkItem("text")];
    case "code-tip":
    default:             return [mkItem("text"), mkItem("code")];
  }
}

const DEFAULT_CONTENT: TipCardContent = {
  layoutType:     "bullet-list",
  background:     { type: "solid", value: "#1e1b4b" },
  primaryColor:   "#6366f1",
  secondaryColor: "#8b5cf6",
  items:          defaultItems("bullet-list"),
};

// ─── Component ────────────────────────────────────────────────────────────────

export function CreateTipEditor({ username }: { username: string }) {
  const router = useRouter();

  const [title,      setTitle]      = useState("");
  const [tags,       setTags]       = useState("");
  const [content,    setContent]    = useState<TipCardContent>(DEFAULT_CONTENT);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [tab,        setTab]        = useState<"form" | "preview">("form");

  function patch(p: Partial<TipCardContent>) {
    setContent((prev) => ({ ...prev, ...p }));
  }

  function handleLayoutChange(layoutType: LayoutType) {
    patch({ layoutType, items: defaultItems(layoutType) });
  }

  async function handlePublish() {
    if (!title.trim()) { setError("Title is required"); return; }

    setSubmitting(true);
    setError(null);

    try {
      const tagList = tags
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      const res = await fetch("/api/posts", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ title, content, tags: tagList }),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to publish"); return; }
      router.push(`/posts/${data.id}`);
    } catch {
      setError("Network error — please try again");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen">
      {/* Mobile tab bar */}
      <div className="flex border-b border-neutral-800 md:hidden">
        <TabBtn active={tab === "form"}    onClick={() => setTab("form")}>Edit</TabBtn>
        <TabBtn active={tab === "preview"} onClick={() => setTab("preview")}>Preview</TabBtn>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 md:grid md:grid-cols-[1fr_400px] md:gap-8 md:items-start">

        {/* ── Left: form ───────────────────────────────────────────────── */}
        <div className={tab === "preview" ? "hidden md:block" : "space-y-7"}>

          <FormSection title="Title">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 5 TypeScript tips every dev should know"
              className={inputCls}
              maxLength={100}
            />
          </FormSection>

          <FormSection title="Layout">
            <LayoutPicker value={content.layoutType} onChange={handleLayoutChange} />
          </FormSection>

          <FormSection title="Content">
            <ContentBlocks
              layoutType={content.layoutType}
              items={content.items}
              onChange={(items) => patch({ items })}
            />
          </FormSection>

          <FormSection title="Appearance">
            <ColorPicker
              background={content.background}
              primaryColor={content.primaryColor}
              secondaryColor={content.secondaryColor}
              onChange={({ background, primaryColor, secondaryColor }) =>
                patch({ background, primaryColor, secondaryColor })
              }
            />
          </FormSection>

          <FormSection title="Tags" hint="Comma-separated · max 10">
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="typescript, react, performance"
              className={inputCls}
            />
          </FormSection>

        </div>

        {/* ── Right: preview + publish ─────────────────────────────────── */}
        <div className={`${tab === "form" ? "hidden md:block" : ""} space-y-4`}>
          <div className="sticky top-6 space-y-4">

            <TipCardPreview
              content={content}
              title={title}
              username={username}
              className="w-full shadow-2xl shadow-black/40"
            />

            <button
              onClick={handlePublish}
              disabled={submitting}
              className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
            >
              {submitting ? "Publishing…" : "Publish tip card"}
            </button>

            {error && (
              <p className="text-center text-sm text-red-400">{error}</p>
            )}

            <p className="text-center text-xs text-neutral-500">
              A 1080 × 1080 PNG is auto-generated and stored when you publish.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Layout helpers ───────────────────────────────────────────────────────────

const inputCls =
  "w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

function FormSection({
  title,
  hint,
  children,
}: {
  title:    string;
  hint?:    string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2.5">
      <div>
        <h3 className="text-sm font-semibold text-neutral-200">{title}</h3>
        {hint && <p className="mt-0.5 text-xs text-neutral-500">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active:   boolean;
  onClick:  () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
        active
          ? "border-b-2 border-indigo-500 text-white"
          : "text-neutral-400 hover:text-neutral-200"
      }`}
    >
      {children}
    </button>
  );
}
