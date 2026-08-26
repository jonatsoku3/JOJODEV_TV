"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function ChannelLogo({
  name,
  logo,
  className,
}: {
  name: string;
  logo: string | null;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const initial = name.trim().slice(0, 2).toUpperCase();

  return (
    <div
      className={cn(
        "relative grid place-items-center overflow-hidden bg-gradient-to-br from-white/10 via-white/5 to-transparent",
        className
      )}
    >
      {logo && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logo}
          alt=""
          className="max-h-[70%] max-w-[78%] object-contain drop-shadow-md"
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="font-heading text-lg font-semibold tracking-wide text-white/80">
          {initial}
        </span>
      )}
    </div>
  );
}
