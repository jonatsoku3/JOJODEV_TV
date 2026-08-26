"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { AlertTriangle, Loader2, Maximize, Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addRecent } from "@/hooks/use-library";
import { COPY } from "@/lib/i18n";
import type { StreamSource } from "@/lib/types";

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable;
}

async function tryPlay(video: HTMLVideoElement) {
  try {
    await video.play();
  } catch {
    video.muted = true;
    await video.play().catch(() => undefined);
  }
}

export function LivePlayer({
  channelId,
  streams,
}: {
  channelId: string;
  streams: StreamSource[];
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [index, setIndex] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<"loading" | "playing" | "error">("loading");
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    addRecent(channelId);
  }, [channelId]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streams.length) {
      setStatus("error");
      return;
    }

    const src = `/api/play/${encodeURIComponent(channelId)}?i=${index}`;
    let cancelled = false;
    setStatus("loading");
    setPaused(false);

    const fail = () => {
      if (cancelled) return;
      if (index < streams.length - 1) {
        setIndex((value) => value + 1);
        return;
      }
      setStatus("error");
    };

    const onPlaying = () => {
      if (!cancelled) setStatus("playing");
    };
    const onPause = () => setPaused(true);
    const onPlay = () => setPaused(false);

    video.addEventListener("playing", onPlaying);
    video.addEventListener("pause", onPause);
    video.addEventListener("play", onPlay);
    video.addEventListener("error", fail);

    if (video.canPlayType("application/vnd.apple.mpegurl") && !Hls.isSupported()) {
      video.src = src;
      tryPlay(video);
    } else if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        fragLoadingMaxRetry: 4,
        manifestLoadingMaxRetry: 3,
        manifestLoadingRetryDelay: 800,
      });
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        tryPlay(video);
      });
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (!data.fatal) return;
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
          window.setTimeout(() => {
            if (!cancelled && video.readyState < 2) fail();
          }, 5000);
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          fail();
        }
      });
    } else {
      video.src = src;
      tryPlay(video).catch(fail);
    }

    return () => {
      cancelled = true;
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("error", fail);
      hlsRef.current?.destroy();
      hlsRef.current = null;
      video.removeAttribute("src");
      video.load();
    };
  }, [channelId, index, attempt, streams.length]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;
      const video = videoRef.current;
      if (!video) return;
      if (event.key === " ") {
        event.preventDefault();
        if (video.paused) tryPlay(video);
        else video.pause();
      }
      if (event.key === "f" || event.key === "F") {
        if (document.fullscreenElement) document.exitFullscreen().catch(() => undefined);
        else video.requestFullscreen().catch(() => undefined);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function retry() {
    if (index < streams.length - 1) {
      setIndex((value) => value + 1);
      return;
    }
    setIndex(0);
    setAttempt((value) => value + 1);
  }

  return (
    <div className="overflow-hidden rounded-[1.6rem] bg-black ring-1 ring-white/12 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
      <div className="relative aspect-video">
        <video
          ref={videoRef}
          className="size-full bg-black object-contain"
          controls
          autoPlay
          playsInline
        />
        {status === "loading" ? (
          <div className="absolute inset-0 grid place-items-center bg-black/55 text-sm">
            <div className="flex items-center gap-2 rounded-full bg-black/60 px-4 py-2">
              <Loader2 className="size-4 animate-spin" />
              {COPY.loading}
            </div>
          </div>
        ) : null}
        {status === "error" ? (
          <div className="absolute inset-0 grid place-items-center bg-black/80 px-6 text-center">
            <div className="max-w-md space-y-3">
              <AlertTriangle className="mx-auto size-8 text-primary" />
              <h2 className="font-heading text-lg font-semibold">{COPY.errorTitle}</h2>
              <p className="text-sm text-white/70">{COPY.errorBody}</p>
              <Button onClick={retry} className="rounded-full">
                <RotateCcw className="size-4" />
                {streams.length > 1 ? COPY.tryNext : COPY.retry}
              </Button>
            </div>
          </div>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/8 bg-gradient-to-r from-[#140b18] to-[#0d0a16] px-4 py-3 text-xs text-white/65">
        <p>
          {COPY.playing} · {COPY.streams} {index + 1}/{streams.length}
          {streams[index]?.quality ? ` · ${streams[index].quality}` : ""}
        </p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              const video = videoRef.current;
              if (!video) return;
              if (video.paused) tryPlay(video);
              else video.pause();
            }}
          >
            {paused ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => videoRef.current?.requestFullscreen().catch(() => undefined)}
          >
            <Maximize className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
