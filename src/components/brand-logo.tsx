import { COPY } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function BrandMark({
  className,
  size = "sm",
}: {
  className?: string;
  size?: "sm" | "lg";
}) {
  return (
    <span className={cn("inline-flex shrink-0 items-center", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/jojo-dev-tv-logo.png"
        alt={COPY.brand}
        width={size === "lg" ? 208 : 56}
        height={size === "lg" ? 208 : 56}
        className={cn(
          "rounded-xl object-cover shadow-[0_0_28px_rgba(244,63,94,0.35)] ring-1 ring-amber-300/30",
          size === "lg" ? "h-40 w-40 sm:h-52 sm:w-52" : "h-12 w-12 sm:h-14 sm:w-14",
        )}
      />
      {size === "sm" ? (
        <span className="sr-only">{COPY.brand}</span>
      ) : null}
    </span>
  );
}
