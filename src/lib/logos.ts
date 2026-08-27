import { logoPath } from "@/lib/signing";

const PROXY_HOSTS = [
  "imgur.com",
  "i.imgur.com",
  "ibb.co",
  "i.ibb.co",
  "postimg.cc",
  "i.postimg.cc",
  "tinypic.com",
  "photobucket.com",
];

const FAST_HOSTS = [
  "upload.wikimedia.org",
  "commons.wikimedia.org",
  "raw.githubusercontent.com",
  "github.com",
  "avatars.githubusercontent.com",
  "cdn.jsdelivr.net",
  "fastly.jsdelivr.net",
  "unpkg.com",
  "yt3.ggpht.com",
  "lh3.googleusercontent.com",
  "logo.clearbit.com",
  "cdn.simpleicons.org",
];

function hostOf(url: string) {
  try {
    return new URL(url).hostname.toLowerCase().replace(/\.$/, "");
  } catch {
    return "";
  }
}

function hostMatches(host: string, list: string[]) {
  return list.some((item) => host === item || host.endsWith(`.${item}`));
}

/** Shrink huge Wikimedia originals so cards paint in tens of KB, not megabytes. */
export function compactLogoUrl(url: string) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();

    if (host === "upload.wikimedia.org") {
      parsed.pathname = parsed.pathname.replace(/\/(\d+)px-/i, (full, n) =>
        Number(n) > 256 ? "/256px-" : full,
      );
      const path = parsed.pathname;
      if (!path.includes("/thumb/")) {
        const match = path.match(/^\/(wikipedia\/[^/]+)\/([0-9a-f])\/([0-9a-f]{2})\/([^/]+)$/i);
        if (match) {
          const [, wiki, a, ab, file] = match;
          if (/\.svg$/i.test(file)) {
            return `https://upload.wikimedia.org/${wiki}/thumb/${a}/${ab}/${file}/256px-${file}.png`;
          }
          if (/\.(png|jpe?g|gif|webp)$/i.test(file)) {
            return `https://upload.wikimedia.org/${wiki}/thumb/${a}/${ab}/${file}/256px-${file}`;
          }
        }
      }
      return parsed.toString();
    }

    if (host.endsWith("wikia.nocookie.net") || host.endsWith("wikia.com")) {
      if (/\/scale-to-width-down\/\d+/i.test(parsed.pathname)) {
        parsed.pathname = parsed.pathname.replace(/\/scale-to-width-down\/\d+/i, "/scale-to-width-down/256");
      }
      return parsed.toString();
    }
  } catch {
    /* keep original */
  }
  return url;
}

export function scoreLogoUrl(url: string) {
  const host = hostOf(url);
  let score = 0;
  if (url.toLowerCase().startsWith("http://")) score -= 60;
  if (hostMatches(host, PROXY_HOSTS)) score -= 900;
  if (hostMatches(host, FAST_HOSTS)) score += 200;
  return score;
}

export function needsLogoProxy(url: string) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase().replace(/\.$/, "");
    if (parsed.protocol === "http:") return true;
    return hostMatches(host, PROXY_HOSTS);
  } catch {
    return true;
  }
}

export function publicLogoUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const compact = compactLogoUrl(url);
  if (needsLogoProxy(compact)) return logoPath(compact);
  return compact;
}
