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
    <header className="sticky top-0 z-40 border-b border-white/8 bg-[#0b0714]/70 backdrop-blur-2xl">
      <div className="mx-auto flex h-[4.75rem] w-full max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="shrink-0">
          <BrandMark />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-sm transition",
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

        <SearchForm className="ml-auto hidden max-w-md flex-1 md:block" />

        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" className="ml-auto md:hidden" />
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
                        "flex items-center gap-3 rounded-xl px-3 py-3 text-sm hover:bg-white/8",
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
