"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { AlertTriangle, Loader2, Maximize, Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addRecent } from "@/hooks/use-library";
import { COPY } from "@/lib/i18n";
import type { StreamSource } from "@/lib/types";
import { cn } from "@/lib/utils";

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

function pickMaxLevel(hls: Hls) {
  const levels = hls.levels;
  if (!levels.length) return -1;
  let idx = 0;
  for (let i = 1; i < levels.length; i++) {
    const current = levels[idx];
    const next = levels[i];
    const currentH = current.height || 0;
    const nextH = next.height || 0;
    if (nextH > currentH || (nextH === currentH && (next.bitrate || 0) > (current.bitrate || 0))) {
      idx = i;
    }
  }
  return idx;
}

function applyMaxQuality(hls: Hls) {
  const max = pickMaxLevel(hls);
  if (max < 0) return;
  hls.startLevel = max;
  hls.loadLevel = max;
  hls.nextLevel = max;
  hls.currentLevel = max;
  hls.autoLevelCapping = max;
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
  const [playbackSize, setPlaybackSize] = useState("");

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
    setPlaybackSize("");

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
    const onResize = () => {
      if (video.videoWidth && video.videoHeight) {
        setPlaybackSize(`${video.videoWidth}×${video.videoHeight}`);
      }
    };

    video.addEventListener("playing", onPlaying);
    video.addEventListener("pause", onPause);
    video.addEventListener("play", onPlay);
    video.addEventListener("error", fail);
    video.addEventListener("loadedmetadata", onResize);
    video.addEventListener("resize", onResize);

    if (video.canPlayType("application/vnd.apple.mpegurl") && !Hls.isSupported()) {
      video.src = src;
      tryPlay(video);
    } else if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        capLevelToPlayerSize: false,
        startLevel: -1,
        abrEwmaDefaultEstimate: 20_000_000,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        maxBufferSize: 60 * 1000 * 1000,
        fragLoadingMaxRetry: 4,
        manifestLoadingMaxRetry: 3,
        manifestLoadingRetryDelay: 800,
        startFragPrefetch: true,
      });
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        applyMaxQuality(hls);
        tryPlay(video);
      });
      hls.on(Hls.Events.LEVEL_SWITCHED, () => {
        const level = hls.levels[hls.currentLevel];
        if (level?.height) setPlaybackSize(`${level.width || "?"}×${level.height}`);
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
      video.removeEventListener("loadedmetadata", onResize);
      video.removeEventListener("resize", onResize);
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
      <div className="relative aspect-video min-h-[200px] w-full sm:min-h-[280px] lg:min-h-[420px] tv:min-h-[640px]">
        <video
          ref={videoRef}
          className="size-full bg-black object-contain [image-rendering:auto]"
          controls
          autoPlay
          playsInline
          preload="auto"
        />
        {status === "playing" ? (
          <span className="pointer-events-none absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold tracking-[0.16em] text-white uppercase shadow-lg">
            <span className="size-1.5 rounded-full bg-white" />
            {COPY.live}
          </span>
        ) : null}
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
          {COPY.qualityMax}
          {playbackSize ? ` · ${playbackSize}` : ""}
          {streams[index]?.quality ? ` · ${streams[index].quality}` : ""}
          {` · ${COPY.streams} ${index + 1}/${streams.length}`}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {streams.length > 1 ? (
            <div className="flex max-w-full flex-wrap gap-1">
              {streams.slice(0, 6).map((stream, streamIndex) => (
                <button
                  key={`${stream.url}-${streamIndex}`}
                  type="button"
                  onClick={() => setIndex(streamIndex)}
                  className={cn(
                    "rounded-full px-2 py-1 text-[11px] ring-1 transition",
                    streamIndex === index
                      ? "bg-amber-300/20 text-amber-100 ring-amber-200/30"
                      : "bg-white/5 text-white/60 ring-white/10 hover:text-white",
                  )}
                >
                  {stream.quality || `${COPY.streams} ${streamIndex + 1}`}
                </button>
              ))}
            </div>
          ) : null}
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
