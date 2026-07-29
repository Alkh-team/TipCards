import type { LayoutType } from "@/types";

const LAYOUTS: {
  type:        LayoutType;
  label:       string;
  icon:        string;
  description: string;
}[] = [
  { type: "bullet-list",  label: "Bullet List",    icon: "☰",   description: "Key takeaways as a list" },
  { type: "do-dont",      label: "Do / Don't",     icon: "✓✗",  description: "Side-by-side dos and don'ts" },
  { type: "before-after", label: "Before / After", icon: "⇄",   description: "Code before and after" },
  { type: "code-tip",     label: "Code Tip",       icon: "</>", description: "Snippet with explanation" },
  { type: "quote",        label: "Quote",          icon: "❝",   description: "An inspiring quote" },
];

interface LayoutPickerProps {
  value:    LayoutType;
  onChange: (type: LayoutType) => void;
}

export function LayoutPicker({ value, onChange }: LayoutPickerProps) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
      {LAYOUTS.map((l) => (
        <button
          key={l.type}
          type="button"
          title={l.description}
          onClick={() => onChange(l.type)}
          className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center text-xs font-medium transition-colors ${
            value === l.type
              ? "border-indigo-500 bg-indigo-900/40 text-white"
              : "border-neutral-700 bg-neutral-800/60 text-neutral-400 hover:border-neutral-500 hover:text-neutral-200"
          }`}
        >
          <span className="text-lg leading-none">{l.icon}</span>
          <span className="leading-tight">{l.label}</span>
        </button>
      ))}
    </div>
  );
}
