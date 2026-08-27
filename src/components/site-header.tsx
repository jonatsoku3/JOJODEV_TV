"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Menu, Globe2, LayoutGrid, House } from "lucide-react";
import { BrandMark } from "@/components/brand-logo";
import { SearchForm } from "@/components/search-form";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { COPY } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: COPY.home, icon: House },
  { href: "/browse", label: COPY.browse, icon: LayoutGrid },
  { href: "/countries", label: COPY.countries, icon: Globe2 },
  { href: "/favorites", label: COPY.favorites, icon: Heart },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-[#0b0714]/70 pt-[env(safe-area-inset-top)] backdrop-blur-2xl">
      <div className="app-width flex h-16 items-center gap-3 sm:h-[4.75rem] tv:h-20">
        <Link href="/" className="shrink-0 rounded-xl focus-visible:outline-offset-4">
          <BrandMark />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex tv:gap-2">
          {NAV.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-3.5 py-2 text-sm transition tv:px-5 tv:py-2.5 tv:text-base",
                  active
                    ? "bg-gradient-to-r from-rose-500/30 to-amber-400/20 text-white ring-1 ring-white/15"
                    : "text-white/65 hover:bg-white/8 hover:text-white"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <SearchForm className="ml-auto hidden max-w-md flex-1 lg:block tv:max-w-xl" />

        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" className="ml-auto size-11 lg:hidden" />
            }
          >
            <Menu className="size-5" />
            <span className="sr-only">{COPY.menu}</span>
          </SheetTrigger>
          <SheetContent side="right" className="border-white/10 bg-[#140e1f]">
            <SheetHeader>
              <SheetTitle>
                <BrandMark />
              </SheetTitle>
            </SheetHeader>
            <div className="space-y-4 px-4">
              <SearchForm onNavigate={() => setMenuOpen(false)} />
              <nav className="grid gap-1">
                {NAV.map((item) => {
                  const Icon = item.icon;
                  const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className={cn(
                        "flex min-h-12 items-center gap-3 rounded-xl px-3 py-3 text-base hover:bg-white/8",
                        active && "bg-gradient-to-r from-rose-500/25 to-amber-400/15 text-white"
                      )}
                    >
                      <Icon className="size-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
