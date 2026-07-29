import Link from "next/link";

interface SocialLinksProps {
  links: Record<string, string>;
}

const SOCIAL_LABELS: Record<string, string> = {
  twitter:  "Twitter / X",
  github:   "GitHub",
  linkedin: "LinkedIn",
  website:  "Website",
};

const SOCIAL_ICONS: Record<string, string> = {
  twitter:  "𝕏",
  github:   "⌥",
  linkedin: "in",
  website:  "↗",
};

export function SocialLinks({ links }: SocialLinksProps) {
  const entries = Object.entries(links).filter(([, v]) => Boolean(v));
  if (entries.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {entries.map(([key, url]) => (
        <Link
          key={key}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:border-neutral-500 hover:text-white transition-colors"
        >
          <span aria-hidden="true">{SOCIAL_ICONS[key] ?? "↗"}</span>
          {SOCIAL_LABELS[key] ?? key}
        </Link>
      ))}
    </div>
  );
}
