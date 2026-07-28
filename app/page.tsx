import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero */}
      <section className="w-full px-4 py-24 text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-800 bg-indigo-950/50 px-4 py-1.5 text-xs font-medium text-indigo-300">
          Now in beta &mdash; create your first tip card free
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white leading-tight tracking-tight">
          Share knowledge with{" "}
          <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            beautiful tip cards
          </span>
        </h1>
        <p className="max-w-xl mx-auto text-lg text-neutral-400 leading-relaxed">
          Create stunning visual tip cards for coding, productivity, design, and more.
          Browse community templates, customize with your branding, and export in seconds.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/auth/register"
            className="rounded-xl bg-indigo-600 px-8 py-3 text-base font-semibold text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-900/50"
          >
            Start creating free
          </Link>
          <Link
            href="/explore"
            className="rounded-xl border border-neutral-700 bg-neutral-900 px-8 py-3 text-base font-semibold text-neutral-200 hover:border-neutral-500 transition-colors"
          >
            Explore tips
          </Link>
        </div>
      </section>

      {/* Feature highlights */}
      <section className="w-full max-w-5xl mx-auto px-4 py-16 grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { icon: "palette", title: "Beautiful Templates", desc: "Pick from dozens of layouts: do/dont, before/after, code tips, quotes, and more." },
          { icon: "editor", title: "Form-Based Editor", desc: "No design skills needed. Fill in your content, pick colors, and see a live preview." },
          { icon: "export", title: "Export and Share", desc: "Export as a crisp PNG in Instagram, Twitter, or LinkedIn sizes with one click." },
        ].map((f) => (
          <div key={f.title} className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 space-y-3">
            <div className="h-8 w-8 rounded-lg bg-indigo-600/20 flex items-center justify-center text-indigo-400 font-bold text-xs uppercase">{f.icon.slice(0, 2)}</div>
            <h3 className="font-semibold text-white">{f.title}</h3>
            <p className="text-sm text-neutral-400 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* CTA strip */}
      <section className="w-full py-20 px-4 text-center bg-gradient-to-b from-neutral-950 to-indigo-950/20">
        <h2 className="text-3xl font-bold text-white mb-4">
          Ready to create your first tip card?
        </h2>
        <p className="text-neutral-400 mb-8 max-w-sm mx-auto">
          Free to browse. Upgrade to Creator to post your own and build an audience.
        </p>
        <Link
          href="/auth/register"
          className="inline-flex rounded-xl bg-indigo-600 px-10 py-3.5 text-base font-semibold text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-900/50"
        >
          Sign up free
        </Link>
      </section>
    </div>
  );
}
