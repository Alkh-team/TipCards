"use client";

import type { TipCardContent, ContentItem } from "@/types";

interface TipCardPreviewProps {
  content:   TipCardContent;
  title:     string;
  username?: string;
  className?: string;
}

/**
 * Browser-rendered preview of the tip card.
 * Proportions and colours mirror the Satori-exported 1080×1080 PNG.
 */
export function TipCardPreview({
  content,
  title,
  username,
  className = "",
}: TipCardPreviewProps) {
  const { background } = content;

  const bgStyle: React.CSSProperties =
    background?.type === "gradient"
      ? { background: background.value }
      : { backgroundColor: background?.value ?? "#1e1b4b" };

  return (
    <div
      className={`relative aspect-square overflow-hidden rounded-2xl text-white ${className}`}
      style={bgStyle}
    >
      <div className="absolute inset-0 flex flex-col p-7">
        {/* Title */}
        <h2 className="mb-4 text-base font-bold leading-snug wrap-break-word">
          {title || <span className="opacity-30">Card title…</span>}
        </h2>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <PreviewContent content={content} />
        </div>

        {/* Branding */}
        {username && (
          <p className="mt-3 text-[10px] opacity-40">@{username}</p>
        )}
      </div>
    </div>
  );
}

// ─── Layout renderers ─────────────────────────────────────────────────────────

function PreviewContent({ content }: { content: TipCardContent }) {
  const { layoutType, items, primaryColor = "#6366f1" } = content;

  if (layoutType === "bullet-list") {
    return (
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-xs leading-relaxed">
            <span className="mt-0.5 shrink-0" style={{ color: primaryColor }}>•</span>
            <span className="wrap-break-word">{item.content || <span className="opacity-30">…</span>}</span>
          </li>
        ))}
      </ul>
    );
  }

  if (layoutType === "do-dont") {
    return (
      <div className="grid h-full grid-cols-2 gap-3">
        <PreviewCol
          title="✓ Do"
          items={items.filter((i) => i.type === "do")}
          accent={primaryColor}
        />
        <PreviewCol
          title="✗ Don't"
          items={items.filter((i) => i.type === "dont")}
          accent="#ef4444"
        />
      </div>
    );
  }

  if (layoutType === "before-after") {
    return (
      <div className="grid h-full grid-cols-2 gap-3">
        <PreviewCol
          title="Before"
          items={items.filter((i) => i.type === "before")}
          accent="#94a3b8"
          mono
        />
        <PreviewCol
          title="After"
          items={items.filter((i) => i.type === "after")}
          accent={primaryColor}
          mono
        />
      </div>
    );
  }

  if (layoutType === "quote") {
    const item = items[0];
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
        <span className="text-4xl leading-none opacity-20" style={{ color: primaryColor }}>❝</span>
        <p className="text-xs italic leading-relaxed">
          {item?.content || <span className="opacity-30">Your quote…</span>}
        </p>
        {item?.label && (
          <p className="text-[10px] opacity-50">— {item.label}</p>
        )}
      </div>
    );
  }

  // code-tip (default)
  const textItem = items.find((i) => i.type === "text");
  const codeItem = items.find((i) => i.type === "code");

  return (
    <div className="flex flex-col gap-2">
      {textItem?.content && (
        <p className="text-xs leading-relaxed">{textItem.content}</p>
      )}
      {codeItem !== undefined && (
        <pre className="overflow-auto rounded-xl bg-black/40 p-3 font-mono text-[10px] leading-relaxed text-green-300">
          <code>{codeItem.content || <span className="opacity-30">// code here</span>}</code>
        </pre>
      )}
    </div>
  );
}

function PreviewCol({
  title,
  items,
  accent,
  mono = false,
}: {
  title:  string;
  items:  ContentItem[];
  accent: string;
  mono?:  boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5 overflow-hidden">
      <p className="text-[10px] font-bold" style={{ color: accent }}>{title}</p>
      {items.map((item, i) => (
        <p
          key={i}
          className={`text-[10px] leading-snug wrap-break-word ${
            mono ? "font-mono" : ""
          }`}
        >
          {item.content || <span className="opacity-30">…</span>}
        </p>
      ))}
    </div>
  );
}
