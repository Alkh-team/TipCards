import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-neutral-800 bg-neutral-950 text-neutral-500 text-sm">
      <div className="mx-auto max-w-7xl px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p>
          &copy; {new Date().getFullYear()}{" "}
          <Link href="/" className="font-semibold text-neutral-300 hover:text-white">
            TipCards
          </Link>
          . All rights reserved.
        </p>
        <nav className="flex flex-wrap gap-6">
          <Link href="/explore" className="hover:text-neutral-200 transition-colors">
            Explore
          </Link>
          <Link href="/templates" className="hover:text-neutral-200 transition-colors">
            Templates
          </Link>
          <Link href="/pricing" className="hover:text-neutral-200 transition-colors">
            Pricing
          </Link>
          <Link href="/auth/login" className="hover:text-neutral-200 transition-colors">
            Login
          </Link>
        </nav>
      </div>
    </footer>
  );
}
