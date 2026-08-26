import { mediaPath } from "@/lib/signing";

export const DEFAULT_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const BLOCKED_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "metadata.google.internal",
]);

function ipv4ToInt(host: string) {
  const parts = host.split(".").map((p) => Number(p));
  if (parts.length !== 4 || parts.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) {
    return null;
  }
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

function isPrivateIpv4(host: string) {
  const n = ipv4ToInt(host);
  if (n === null) return false;
  const a = n >>> 24;
  const b = (n >>> 16) & 255;
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 192 && b === 168) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  return false;
}

export function assertSafeMediaUrl(raw: string) {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error("invalid url");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("unsupported protocol");
  }
  const host = parsed.hostname.toLowerCase().replace(/\.$/, "");
  if (BLOCKED_HOSTS.has(host) || host.endsWith(".localhost") || host.endsWith(".local")) {
    throw new Error("blocked host");
  }
  if (isPrivateIpv4(host)) throw new Error("blocked host");
  if (host.includes(":")) {
    if (host === "::1" || host.startsWith("fe80") || host.startsWith("fc") || host.startsWith("fd")) {
      throw new Error("blocked host");
    }
  }
  return parsed;
}

export function rewritePlaylist(
  content: string,
  playlistUrl: string,
  grant: { ua?: string; referrer?: string }
) {
  const lines = content.split(/\r?\n/);
  return lines
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return line;
      if (trimmed.startsWith("#")) {
        return line
          .replace(/URI=(["'])([^"']+)\1/gi, (_m, quote: string, uri: string) => {
            const abs = new URL(uri, playlistUrl).toString();
            return `URI=${quote}${mediaPath({ url: abs, ua: grant.ua, referrer: grant.referrer })}${quote}`;
          })
          .replace(/URI=([^,"'\s]+)/gi, (full, uri: string) => {
            if (full.includes("/api/media")) return full;
            const abs = new URL(uri, playlistUrl).toString();
            return `URI="${mediaPath({ url: abs, ua: grant.ua, referrer: grant.referrer })}"`;
          });
      }
      const abs = new URL(trimmed, playlistUrl).toString();
      return mediaPath({ url: abs, ua: grant.ua, referrer: grant.referrer });
    })
    .join("\n");
}

export function looksLikePlaylist(url: string, contentType: string | null, bodyStart: string) {
  const path = new URL(url).pathname.toLowerCase();
  if (path.endsWith(".m3u8") || path.endsWith(".m3u")) return true;
  const type = (contentType || "").toLowerCase();
  if (type.includes("mpegurl") || type.includes("m3u8") || type.includes("vnd.apple")) {
    return true;
  }
  return bodyStart.startsWith("#EXTM3U");
}

export async function fetchUpstream(
  url: string,
  init: { ua?: string; referrer?: string; range?: string | null }
) {
  let current = assertSafeMediaUrl(url).toString();
  for (let hop = 0; hop < 5; hop++) {
    assertSafeMediaUrl(current);
    const headers: Record<string, string> = {
      "User-Agent": init.ua || DEFAULT_UA,
      Accept: "*/*",
    };
    if (init.referrer) {
      headers.Referer = init.referrer;
      try {
        headers.Origin = new URL(init.referrer).origin;
      } catch {
        /* ignore */
      }
    }
    if (init.range) headers.Range = init.range;

    const res = await fetch(current, {
      headers,
      redirect: "manual",
      cache: "no-store",
      signal: AbortSignal.timeout(25000),
    });

    if ([301, 302, 303, 307, 308].includes(res.status)) {
      const location = res.headers.get("location");
      if (!location) throw new Error("redirect without location");
      current = new URL(location, current).toString();
      continue;
    }

    return { res, finalUrl: current };
  }
  throw new Error("too many redirects");
}

export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  "Access-Control-Allow-Headers": "Range, Origin, Accept, Content-Type",
  "Access-Control-Expose-Headers":
    "Content-Length, Content-Range, Content-Type, Accept-Ranges",
};
