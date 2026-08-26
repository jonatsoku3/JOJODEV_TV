import Link from "next/link";
import { BrandMark } from "@/components/brand-logo";
import { COPY } from "@/lib/i18n";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-white/8 bg-black/20 py-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 text-sm text-white/55 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <BrandMark />
          <div className="flex gap-4">
            <Link href="/browse" className="hover:text-amber-200">
              {COPY.browse}
            </Link>
            <Link href="/countries" className="hover:text-amber-200">
              {COPY.countries}
            </Link>
            <Link href="/favorites" className="hover:text-amber-200">
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
