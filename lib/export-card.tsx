/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og";
import type { TipCardContent, ContentItem } from "@/types";

const SIZE = 1080;

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Render a tip card as a 1080×1080 PNG Buffer using Satori (via next/og).
 * Upload the buffer to R2 separately with lib/r2.ts.
 */
export async function exportCardToBuffer(
  content:  TipCardContent,
  title:    string,
  username: string,
): Promise<Buffer> {
  const response = new ImageResponse(
    <CardCanvas content={content} title={title} username={username} />,
    { width: SIZE, height: SIZE },
  );

  const ab = await response.arrayBuffer();
  return Buffer.from(ab);
}

// ─── Card canvas ──────────────────────────────────────────────────────────────

function CardCanvas({
  content,
  title,
  username,
}: {
  content:  TipCardContent;
  title:    string;
  username: string;
}) {
  const { background, primaryColor = "#6366f1" } = content;

  const bgStyle: React.CSSProperties =
    background?.type === "gradient"
      ? { background: background.value }
      : { backgroundColor: background?.value ?? "#1e1b4b" };

  return (
    <div
      style={{
        display:       "flex",
        flexDirection: "column",
        width:         SIZE,
        height:        SIZE,
        padding:       "72px",
        fontFamily:    "sans-serif",
        color:         "#ffffff",
        ...bgStyle,
      }}
    >
      {/* Title */}
      <div
        style={{
          fontSize:     54,
          fontWeight:   700,
          lineHeight:   1.2,
          marginBottom: 48,
        }}
      >
        {title}
      </div>

      {/* Dynamic content */}
      <div style={{ display: "flex", flex: 1 }}>
        <CardContent content={content} />
      </div>

      {/* Branding */}
      <div style={{ display: "flex", marginTop: 28, fontSize: 26, opacity: 0.45 }}>
        @{username}
      </div>
    </div>
  );
}

// ─── Content renderers ────────────────────────────────────────────────────────

function CardContent({ content }: { content: TipCardContent }) {
  const { layoutType, items, primaryColor = "#6366f1" } = content;

  if (layoutType === "bullet-list") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 22, fontSize: 38 }}>
            <span style={{ color: primaryColor, fontSize: 44, lineHeight: "1.05" }}>•</span>
            <span style={{ lineHeight: "1.45" }}>{item.content}</span>
          </div>
        ))}
      </div>
    );
  }

  if (layoutType === "do-dont") {
    return (
      <div style={{ display: "flex", gap: 52, flex: 1 }}>
        <CardColumn
          title="✓  Do"
          items={items.filter((i) => i.type === "do")}
          accent={primaryColor}
        />
        <CardColumn
          title="✗  Don't"
          items={items.filter((i) => i.type === "dont")}
          accent="#ef4444"
        />
      </div>
    );
  }

  if (layoutType === "before-after") {
    return (
      <div style={{ display: "flex", gap: 52, flex: 1 }}>
        <CardColumn
          title="Before"
          items={items.filter((i) => i.type === "before")}
          accent="#94a3b8"
          mono
        />
        <CardColumn
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
      <div
        style={{
          display:        "flex",
          flexDirection:  "column",
          alignItems:     "center",
          justifyContent: "center",
          flex:           1,
          textAlign:      "center",
          gap:            32,
        }}
      >
        <div style={{ fontSize: 130, color: primaryColor, opacity: 0.2, lineHeight: "0.5" }}>❝</div>
        <div style={{ fontSize: 44, lineHeight: "1.45" }}>{item?.content ?? ""}</div>
        {item?.label && (
          <div style={{ fontSize: 30, opacity: 0.55 }}>— {item.label}</div>
        )}
      </div>
    );
  }

  // code-tip (default)
  const textItem = items.find((i) => i.type === "text");
  const codeItem = items.find((i) => i.type === "code");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {textItem?.content && (
        <div style={{ fontSize: 38, lineHeight: "1.45" }}>{textItem.content}</div>
      )}
      {codeItem?.content && (
        <div
          style={{
            backgroundColor: "rgba(0,0,0,0.45)",
            borderRadius:    20,
            padding:         "36px 44px",
            fontFamily:      "monospace",
            fontSize:        30,
            lineHeight:      "1.65",
            color:           "#86efac",
            whiteSpace:      "pre",
          }}
        >
          {codeItem.content}
        </div>
      )}
    </div>
  );
}

function CardColumn({
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
    <div style={{ display: "flex", flex: 1, flexDirection: "column", gap: 22 }}>
      <div style={{ fontSize: 30, fontWeight: 700, color: accent }}>{title}</div>
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            display:    "flex",
            fontSize:   34,
            lineHeight: "1.45",
            fontFamily: mono ? "monospace" : "sans-serif",
            color:      "rgba(255,255,255,0.85)",
          }}
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}
