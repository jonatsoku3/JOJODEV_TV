"use client";

import { useEffect, useRef, useState } from "react";
import { cardTint } from "@/lib/palette";
import { cn } from "@/lib/utils";

export function ChannelLogo({
  name,
  logo,
  seed,
  className,
  priority = false,
}: {
  name: string;
  logo: string | null;
  seed?: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <ChannelLogoInner
      key={logo || name}
      name={name}
      logo={logo}
      seed={seed}
      className={className}
      priority={priority}
    />
  );
}

function ChannelLogoInner({
  name,
  logo,
  seed,
  className,
  priority,
}: {
  name: string;
  logo: string | null;
  seed?: string;
  className?: string;
  priority: boolean;
}) {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const readyRef = useRef(false);
  const timerRef = useRef<number>(0);
  const initial = name.trim().slice(0, 2).toUpperCase();
  const showLogo = Boolean(logo) && !failed;

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  function armTimeout() {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      if (!readyRef.current) setFailed(true);
    }, 8000);
  }

  return (
    <div
      className={cn(
        "relative grid place-items-center overflow-hidden [container-type:size]",
        className,
      )}
      style={cardTint(seed || name)}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.22),transparent_42%)]" />
      <span
        className={cn(
          "relative z-10 font-heading text-[clamp(1.35rem,22cqmin,4.5rem)] font-semibold tracking-wide text-white/90 transition-opacity",
          ready && showLogo ? "opacity-0" : "opacity-100",
        )}
      >
        {initial}
      </span>
      {showLogo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logo!}
          alt=""
          className={cn(
            "absolute inset-[16%] z-20 m-auto max-h-[68%] max-w-[76%] object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)] transition-opacity duration-200",
            ready ? "opacity-100" : "opacity-0",
          )}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
          referrerPolicy="no-referrer"
          onLoadStart={armTimeout}
          onLoad={(event) => {
            const img = event.currentTarget;
            if (timerRef.current) window.clearTimeout(timerRef.current);
            if (img.naturalWidth < 8 || img.naturalHeight < 8) {
              setFailed(true);
              setReady(false);
              return;
            }
            readyRef.current = true;
            setReady(true);
          }}
          onError={() => {
            if (timerRef.current) window.clearTimeout(timerRef.current);
            setFailed(true);
            setReady(false);
          }}
        />
      ) : null}
    </div>
  );
}
