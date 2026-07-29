"use client";

import type { BackgroundConfig } from "@/types";

interface ColorPickerProps {
  background:     BackgroundConfig;
  primaryColor:   string;
  secondaryColor: string;
  onChange: (values: {
    background:     BackgroundConfig;
    primaryColor:   string;
    secondaryColor: string;
  }) => void;
}

const SOLID_PRESETS = [
  "#1e1b4b", "#0f172a", "#0c0a09", "#1a1a2e",
  "#1f2937", "#18181b", "#2d1b69", "#0d1117",
];

const GRADIENT_PRESETS = [
  "linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%)",
  "linear-gradient(135deg,#0ea5e9 0%,#6366f1 100%)",
  "linear-gradient(135deg,#f59e0b 0%,#ef4444 100%)",
  "linear-gradient(135deg,#10b981 0%,#0ea5e9 100%)",
  "linear-gradient(135deg,#ec4899 0%,#8b5cf6 100%)",
  "linear-gradient(135deg,#1e1b4b 0%,#312e81 100%)",
  "linear-gradient(135deg,#18181b 0%,#1e1b4b 100%)",
  "linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%)",
];

const ACCENT_PRESETS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b",
  "#10b981", "#0ea5e9", "#ef4444", "#ffffff",
];

export function ColorPicker({
  background,
  primaryColor,
  secondaryColor,
  onChange,
}: ColorPickerProps) {
  const mode = background.type;

  function setMode(newMode: "solid" | "gradient") {
    const defaultValue =
      newMode === "solid" ? "#1e1b4b" : "linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%)";
    onChange({ background: { type: newMode, value: defaultValue }, primaryColor, secondaryColor });
  }

  function setBg(value: string) {
    onChange({ background: { type: mode, value }, primaryColor, secondaryColor });
  }

  function setPrimary(c: string) {
    onChange({ background, primaryColor: c, secondaryColor });
  }

  return (
    <div className="space-y-5">
      {/* Mode toggle */}
      <div className="flex overflow-hidden rounded-lg border border-neutral-700">
        {(["solid", "gradient"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`flex-1 py-1.5 text-xs font-medium capitalize transition-colors ${
              mode === m
                ? "bg-neutral-700 text-white"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Background presets */}
      <div>
        <p className="mb-2 text-xs text-neutral-400">Background</p>
        <div className="flex flex-wrap gap-2">
          {(mode === "solid" ? SOLID_PRESETS : GRADIENT_PRESETS).map((preset) => {
            const isActive =
              background.type === mode && background.value === preset;
            return (
              <button
                key={preset}
                type="button"
                onClick={() => setBg(preset)}
                title={preset}
                style={{ background: preset }}
                className={`h-8 rounded-lg border-2 transition-all ${
                  mode === "solid" ? "w-8" : "w-14"
                } ${isActive ? "scale-110 border-white" : "border-transparent hover:border-neutral-400"}`}
              />
            );
          })}
          {mode === "solid" && (
            <input
              type="color"
              value={background.value.startsWith("#") ? background.value : "#1e1b4b"}
              onChange={(e) => setBg(e.target.value)}
              className="h-8 w-8 cursor-pointer rounded-lg border border-neutral-600 bg-transparent p-0.5"
              title="Custom colour"
            />
          )}
        </div>
      </div>

      {/* Primary accent colour */}
      <div>
        <p className="mb-2 text-xs text-neutral-400">Primary accent</p>
        <div className="flex flex-wrap gap-2">
          {ACCENT_PRESETS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setPrimary(c)}
              style={{ backgroundColor: c }}
              className={`h-8 w-8 rounded-lg border-2 transition-all ${
                primaryColor === c
                  ? "scale-110 border-white"
                  : "border-transparent hover:border-neutral-400"
              }`}
              title={c}
            />
          ))}
          <input
            type="color"
            value={primaryColor}
            onChange={(e) => setPrimary(e.target.value)}
            className="h-8 w-8 cursor-pointer rounded-lg border border-neutral-600 bg-transparent p-0.5"
            title="Custom accent"
          />
        </div>
      </div>
    </div>
  );
}
