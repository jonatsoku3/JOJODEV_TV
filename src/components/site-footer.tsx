import Link from "next/link";
import { COPY } from "@/lib/i18n";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-white/8 py-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 text-sm text-muted-foreground sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {COPY.brand}
          </p>
          <div className="flex gap-4">
            <Link href="/browse" className="hover:text-foreground">
              {COPY.browse}
            </Link>
            <Link href="/countries" className="hover:text-foreground">
              {COPY.countries}
            </Link>
          </div>
        </div>
        <p className="max-w-3xl text-xs leading-relaxed">{COPY.disclaimer}</p>
      </div>
    </footer>
  );
}
