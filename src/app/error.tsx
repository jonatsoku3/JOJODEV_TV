"use client";

import { PageShell } from "@/components/page-shell";
import { buttonVariants } from "@/components/ui/button";
import { COPY } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function ErrorState({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <PageShell className="grid min-h-[50vh] place-items-center text-center">
      <div className="space-y-3">
        <h1 className="font-heading text-2xl font-semibold">{COPY.errorTitle}</h1>
        <p className="max-w-md text-sm text-muted-foreground">{COPY.errorBody}</p>
        <div className="flex justify-center gap-2">
          <button type="button" onClick={reset} className={cn(buttonVariants(), "rounded-full")}>
            {COPY.tryNext}
          </button>
          <Link href="/" className={cn(buttonVariants({ variant: "outline" }), "rounded-full")}>
            {COPY.backHome}
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
