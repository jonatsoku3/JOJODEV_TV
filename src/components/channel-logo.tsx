"use client";

import { useState } from "react";
import { cardTint } from "@/lib/palette";
import { cn } from "@/lib/utils";

export function ChannelLogo({
  name,
  logo,
  seed,
  className,
}: {
  name: string;
  logo: string | null;
  seed?: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const initial = name.trim().slice(0, 2).toUpperCase();

  return (
    <div
      className={cn("relative grid place-items-center overflow-hidden", className)}
      style={cardTint(seed || name)}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.22),transparent_42%)]" />
      {logo && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logo}
          alt=""
          className="relative z-10 max-h-[68%] max-w-[76%] object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="relative z-10 font-heading text-2xl font-semibold tracking-wide text-white/90">
          {initial}
        </span>
      )}
    </div>
  );
}
