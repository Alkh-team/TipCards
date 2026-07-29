"use client";

import type { ContentItem, LayoutType } from "@/types";

interface Props {
  layoutType: LayoutType;
  items:      ContentItem[];
  onChange:   (items: ContentItem[]) => void;
}

function mkItem(type: ContentItem["type"]): ContentItem {
  return { id: crypto.randomUUID(), type, content: "", language: "typescript" };
}

// ─── Public component ─────────────────────────────────────────────────────────

export function ContentBlocks({ layoutType, items, onChange }: Props) {
  function updateById(id: string, patch: Partial<ContentItem>) {
    onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }
  function removeById(id: string) {
    onChange(items.filter((item) => item.id !== id));
  }
  function addItem(type: ContentItem["type"]) {
    onChange([...items, mkItem(type)]);
  }

  // ── Bullet list ────────────────────────────────────────────────────────────
  if (layoutType === "bullet-list") {
    const bullets = items.filter((i) => i.type === "bullet");
    return (
      <div className="space-y-2">
        {bullets.map((item, idx) => (
          <div key={item.id} className="flex items-center gap-2">
            <span className="w-5 shrink-0 text-right text-xs text-indigo-400">{idx + 1}.</span>
            <input
              value={item.content}
              onChange={(e) => updateById(item.id, { content: e.target.value })}
              placeholder="Bullet point…"
              className={input}
            />
            {bullets.length > 1 && (
              <button type="button" onClick={() => removeById(item.id)} className={rmBtn} title="Remove">
                ✕
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={() => addItem("bullet")} className={addBtn}>
          + Add bullet
        </button>
      </div>
    );
  }

  // ── Do / Don't ─────────────────────────────────────────────────────────────
  if (layoutType === "do-dont") {
    return (
      <TwoColEditor
        items={items}
        typeA="do"    labelA="✓ Do"    accentA="text-green-400"
        typeB="dont"  labelB="✗ Don't" accentB="text-red-400"
        onAdd={addItem} onUpdate={updateById} onRemove={removeById}
      />
    );
  }

  // ── Before / After ─────────────────────────────────────────────────────────
  if (layoutType === "before-after") {
    return (
      <TwoColEditor
        items={items}
        typeA="before" labelA="Before" accentA="text-neutral-400"
        typeB="after"  labelB="After"  accentB="text-indigo-400"
        onAdd={addItem} onUpdate={updateById} onRemove={removeById}
        mono
      />
    );
  }

  // ── Quote ──────────────────────────────────────────────────────────────────
  if (layoutType === "quote") {
    const item = items[0] ?? mkItem("text");
    return (
      <div className="space-y-3">
        <textarea
          value={item.content}
          onChange={(e) => onChange([{ ...item, content: e.target.value }])}
          placeholder="Your quote…"
          rows={3}
          className={`${input} resize-none`}
        />
        <input
          value={item.label ?? ""}
          onChange={(e) => onChange([{ ...item, label: e.target.value }])}
          placeholder="Attribution (optional)"
          className={input}
        />
      </div>
    );
  }

  // ── Code tip (default) ─────────────────────────────────────────────────────
  const textItem = items.find((i) => i.type === "text") ?? mkItem("text");
  const codeItem = items.find((i) => i.type === "code") ?? mkItem("code");

  function updateText(value: string) {
    const exists = items.some((i) => i.id === textItem.id);
    if (exists) updateById(textItem.id, { content: value });
    else onChange([{ ...textItem, content: value }, ...items.filter((i) => i.type !== "text")]);
  }
  function updateCode(patch: Partial<ContentItem>) {
    const exists = items.some((i) => i.id === codeItem.id);
    if (exists) updateById(codeItem.id, patch);
    else onChange([...items.filter((i) => i.type !== "code"), { ...codeItem, ...patch }]);
  }

  return (
    <div className="space-y-4">
      <div>
        <label className={label}>Description (optional)</label>
        <input
          value={textItem.content}
          onChange={(e) => updateText(e.target.value)}
          placeholder="Briefly explain the tip…"
          className={input}
        />
      </div>
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className={label}>Code</label>
          <select
            value={codeItem.language ?? "typescript"}
            onChange={(e) => updateCode({ language: e.target.value })}
            className="rounded-lg border border-neutral-700 bg-neutral-800 px-2 py-1 text-xs text-neutral-300 focus:border-indigo-500 focus:outline-none"
          >
            {LANGS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <textarea
          value={codeItem.content}
          onChange={(e) => updateCode({ content: e.target.value })}
          placeholder={`// Your ${codeItem.language ?? "typescript"} code here`}
          rows={8}
          spellCheck={false}
          className={`${input} resize-y font-mono`}
        />
      </div>
    </div>
  );
}

// ─── Two-column editor (shared by do/don't + before/after) ───────────────────

function TwoColEditor({
  items,
  typeA, labelA, accentA,
  typeB, labelB, accentB,
  onAdd, onUpdate, onRemove,
  mono = false,
}: {
  items:    ContentItem[];
  typeA:    ContentItem["type"];  labelA: string; accentA: string;
  typeB:    ContentItem["type"];  labelB: string; accentB: string;
  onAdd:    (type: ContentItem["type"]) => void;
  onUpdate: (id: string, patch: Partial<ContentItem>) => void;
  onRemove: (id: string) => void;
  mono?:    boolean;
}) {
  const colA = items.filter((i) => i.type === typeA);
  const colB = items.filter((i) => i.type === typeB);

  function Col({
    col, type, colLabel, accent,
  }: { col: ContentItem[]; type: ContentItem["type"]; colLabel: string; accent: string }) {
    return (
      <div className="flex-1 space-y-2 min-w-0">
        <p className={`text-xs font-semibold ${accent}`}>{colLabel}</p>
        {col.map((item) => (
          <div key={item.id} className="flex gap-1.5">
            {mono ? (
              <textarea
                rows={2}
                value={item.content}
                onChange={(e) => onUpdate(item.id, { content: e.target.value })}
                placeholder={`${colLabel}…`}
                className={`${input} flex-1 resize-none font-mono text-xs`}
              />
            ) : (
              <input
                value={item.content}
                onChange={(e) => onUpdate(item.id, { content: e.target.value })}
                placeholder={`${colLabel}…`}
                className={`${input} flex-1`}
              />
            )}
            {col.length > 1 && (
              <button type="button" onClick={() => onRemove(item.id)} className={rmBtn} title="Remove">
                ✕
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={() => onAdd(type)} className={addBtn}>
          + Add
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-4">
      <Col col={colA} type={typeA} colLabel={labelA} accent={accentA} />
      <Col col={colB} type={typeB} colLabel={labelB} accent={accentB} />
    </div>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const LANGS = [
  "typescript", "javascript", "python", "rust", "go",
  "bash", "css", "html", "sql", "json",
];

const input =
  "w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

const label = "block text-xs font-medium text-neutral-400 mb-1";

const rmBtn =
  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs text-neutral-500 hover:bg-red-900/30 hover:text-red-400 transition-colors";

const addBtn = "text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors";
