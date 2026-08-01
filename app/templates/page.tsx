import Link from "next/link";

export const metadata = { title: "Templates · CodeTip" };

// ─── Static template catalogue ────────────────────────────────────────────────

const TEMPLATES = [
  {
    id: "js-do-dont",
    name: "JavaScript Do's & Don'ts",
    category: "JavaScript",
    layout: "do-dont",
    description: "Common JS anti-patterns vs the idiomatic way to write them.",
    accent: "#f59e0b",
    bg: "linear-gradient(135deg,#1c1400 0%,#2d1f00 100%)",
    icon: "JS",
  },
  {
    id: "react-before-after",
    name: "React Refactor",
    category: "React",
    layout: "before-after",
    description: "Show messy component code alongside its clean refactored version.",
    accent: "#06b6d4",
    bg: "linear-gradient(135deg,#001b1e 0%,#002830 100%)",
    icon: "Re",
  },
  {
    id: "css-tips",
    name: "CSS Quick Tips",
    category: "CSS",
    layout: "bullet-list",
    description: "A list of CSS tricks every frontend dev should have in their toolkit.",
    accent: "#8b5cf6",
    bg: "linear-gradient(135deg,#0d0a1f 0%,#1a1040 100%)",
    icon: "CS",
  },
  {
    id: "git-commands",
    name: "Git Commands Cheatsheet",
    category: "Git",
    layout: "code-tip",
    description: "Essential git commands with real-world examples and explanations.",
    accent: "#f97316",
    bg: "linear-gradient(135deg,#1a0a00 0%,#2d1400 100%)",
    icon: "GI",
  },
  {
    id: "python-tips",
    name: "Python Best Practices",
    category: "Python",
    layout: "bullet-list",
    description: "Pythonic patterns and idioms that make your code cleaner and faster.",
    accent: "#22c55e",
    bg: "linear-gradient(135deg,#001a07 0%,#002d0f 100%)",
    icon: "Py",
  },
  {
    id: "ts-do-dont",
    name: "TypeScript Type Safety",
    category: "TypeScript",
    layout: "do-dont",
    description: "Type-safe patterns vs common type errors that sneak into codebases.",
    accent: "#3b82f6",
    bg: "linear-gradient(135deg,#00071a 0%,#001030 100%)",
    icon: "TS",
  },
  {
    id: "api-design",
    name: "REST API Design",
    category: "Backend",
    layout: "do-dont",
    description: "Common REST anti-patterns and how to design clean, consistent APIs.",
    accent: "#e879f9",
    bg: "linear-gradient(135deg,#180020 0%,#260030 100%)",
    icon: "AP",
  },
  {
    id: "sql-query",
    name: "SQL Query Patterns",
    category: "Databases",
    layout: "before-after",
    description: "Slow N+1 queries vs optimised joins and indexed lookups.",
    accent: "#fb923c",
    bg: "linear-gradient(135deg,#1a0c00 0%,#2d1800 100%)",
    icon: "DB",
  },
  {
    id: "devops-checklist",
    name: "Deployment Checklist",
    category: "DevOps",
    layout: "bullet-list",
    description: "What to verify before every production deploy.",
    accent: "#a3e635",
    bg: "linear-gradient(135deg,#0a1200 0%,#141f00 100%)",
    icon: "DO",
  },
  {
    id: "docker-tips",
    name: "Docker Best Practices",
    category: "DevOps",
    layout: "code-tip",
    description: "Dockerfile optimisation tips with before/after examples.",
    accent: "#38bdf8",
    bg: "linear-gradient(135deg,#00101a 0%,#001c2d 100%)",
    icon: "DK",
  },
  {
    id: "css-layout",
    name: "Flexbox vs Grid",
    category: "CSS",
    layout: "before-after",
    description: "When to reach for Flexbox vs CSS Grid — with visual side-by-side.",
    accent: "#c084fc",
    bg: "linear-gradient(135deg,#100020 0%,#1d0038 100%)",
    icon: "FX",
  },
  {
    id: "react-hooks",
    name: "React Hooks Patterns",
    category: "React",
    layout: "code-tip",
    description: "Custom hook patterns that reduce boilerplate and improve reusability.",
    accent: "#67e8f9",
    bg: "linear-gradient(135deg,#001520 0%,#002538 100%)",
    icon: "RH",
  },
] as const;

const CATEGORIES = [
  "All",
  "JavaScript",
  "TypeScript",
  "React",
  "CSS",
  "Python",
  "Git",
  "Backend",
  "Databases",
  "DevOps",
] as const;

const LAYOUT_LABELS: Record<string, string> = {
  "do-dont":      "Do / Don't",
  "before-after": "Before / After",
  "bullet-list":  "Bullet List",
  "code-tip":     "Code Tip",
  "quote":        "Quote",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TemplatesPage() {
  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            Coding Tip Templates
          </h1>
          <p className="mt-3 text-neutral-400">
            Start from a template built for developers. Pick a layout, fill in
            your knowledge, and publish in minutes.
          </p>
          <Link
            href="/create"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
          >
            + Start from scratch
          </Link>
        </div>

        {/* Category pills (static — JS-free progressive filter) */}
        <div className="mb-8 flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <span
              key={cat}
              className="cursor-default rounded-full border border-neutral-700 bg-neutral-900 px-3 py-1 text-xs font-medium text-neutral-400"
            >
              {cat}
            </span>
          ))}
        </div>

        {/* Template grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.map((t) => (
            <div
              key={t.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 transition-colors hover:border-neutral-600"
            >
              {/* Visual preview thumbnail */}
              <div
                className="relative flex h-36 items-center justify-center p-6"
                style={{ background: t.bg }}
              >
                {/* Layout indicator lines */}
                <div className="flex w-full flex-col gap-2 opacity-60">
                  {t.layout === "do-dont" || t.layout === "before-after" ? (
                    <div className="flex gap-3">
                      <div className="flex-1 space-y-1.5">
                        <div className="h-1.5 w-1/2 rounded-full" style={{ backgroundColor: t.accent }} />
                        <div className="h-1 w-full rounded-full bg-white/20" />
                        <div className="h-1 w-4/5 rounded-full bg-white/20" />
                        <div className="h-1 w-3/5 rounded-full bg-white/20" />
                      </div>
                      <div className="flex-1 space-y-1.5">
                        <div className="h-1.5 w-1/2 rounded-full bg-red-400/60" />
                        <div className="h-1 w-full rounded-full bg-white/20" />
                        <div className="h-1 w-4/5 rounded-full bg-white/20" />
                        <div className="h-1 w-3/5 rounded-full bg-white/20" />
                      </div>
                    </div>
                  ) : t.layout === "code-tip" ? (
                    <div className="space-y-1.5">
                      <div className="h-1 w-3/4 rounded-full bg-white/30" />
                      <div className="mt-2 rounded bg-black/40 p-2 space-y-1">
                        <div className="h-1 w-full rounded-full" style={{ backgroundColor: t.accent + "99" }} />
                        <div className="h-1 w-4/5 rounded-full" style={{ backgroundColor: t.accent + "66" }} />
                        <div className="h-1 w-3/5 rounded-full" style={{ backgroundColor: t.accent + "66" }} />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: t.accent }} />
                          <div className="h-1 flex-1 rounded-full bg-white/25" style={{ width: `${90 - i * 10}%` }} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Category badge */}
                <span
                  className="absolute right-3 top-3 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                  style={{ backgroundColor: t.accent + "26", color: t.accent }}
                >
                  {t.category}
                </span>
              </div>

              {/* Card body */}
              <div className="flex flex-1 flex-col gap-3 p-5">
                <div>
                  <p className="font-semibold text-white leading-snug">{t.name}</p>
                  <p className="mt-1 text-xs text-neutral-500">
                    {LAYOUT_LABELS[t.layout] ?? t.layout}
                  </p>
                </div>
                <p className="flex-1 text-xs leading-relaxed text-neutral-400">
                  {t.description}
                </p>
                <Link
                  href="/create"
                  className="block w-full rounded-lg border border-neutral-700 px-4 py-2 text-center text-sm font-medium text-neutral-300 transition-colors hover:border-indigo-500 hover:text-indigo-400"
                >
                  Use template →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
