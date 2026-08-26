import { PageShell } from "@/components/page-shell";
import { buttonVariants } from "@/components/ui/button";
import { COPY } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function NotFound() {
  return (
    <PageShell className="grid min-h-[50vh] place-items-center text-center">
      <div className="space-y-3">
        <h1 className="font-heading text-2xl font-semibold">{COPY.emptyTitle}</h1>
        <p className="max-w-md text-sm text-muted-foreground">{COPY.emptyBody}</p>
        <Link href="/" className={cn(buttonVariants(), "rounded-full")}>
          {COPY.backHome}
        </Link>
      </div>
    </PageShell>
  );
}
