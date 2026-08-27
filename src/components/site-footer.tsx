import Link from "next/link";
import { BrandMark } from "@/components/brand-logo";
import { COPY } from "@/lib/i18n";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-white/8 bg-black/20 py-10 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
      <div className="app-width flex flex-col gap-5 text-sm text-white/55">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <BrandMark />
          <div className="flex gap-4">
            <Link href="/browse" className="inline-flex min-h-11 items-center hover:text-amber-200">
              {COPY.browse}
            </Link>
            <Link href="/countries" className="inline-flex min-h-11 items-center hover:text-amber-200">
              {COPY.countries}
            </Link>
            <Link href="/favorites" className="inline-flex min-h-11 items-center hover:text-amber-200">
              {COPY.favorites}
            </Link>
          </div>
        </div>
        <p className="max-w-3xl text-xs leading-relaxed">{COPY.disclaimer}</p>
        <p>© {new Date().getFullYear()} {COPY.brand}</p>
      </div>
    </footer>
  );
}
