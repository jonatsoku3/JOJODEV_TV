import { CORS_HEADERS, DEFAULT_UA, assertSafeMediaUrl } from "@/lib/media";
import { verifyLogo } from "@/lib/signing";

export const runtime = "nodejs";
export const revalidate = 604800;

const MAX_BYTES = 700_000;
const memory = new Map<string, { type: string; body: Uint8Array; at: number }>();
const CACHE_MS = 24 * 60 * 60 * 1000;

function isImageType(type: string | null, url: string) {
  const value = (type || "").toLowerCase();
  if (value.startsWith("image/")) return true;
  if (value.includes("svg")) return true;
  return /\.(svg|png|jpe?g|webp|gif|avif|ico)(\?|$)/i.test(url);
}

function cached(body: Uint8Array, type: string) {
  return new Response(Buffer.from(body), {
    headers: {
      ...CORS_HEADERS,
      "Content-Type": type,
      "Cache-Control": "public, max-age=604800, s-maxage=604800, stale-while-revalidate=86400",
    },
  });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const target = url.searchParams.get("u") || "";
  const sig = url.searchParams.get("s") || "";
  if (!target || !verifyLogo(target, sig)) {
    return new Response("forbidden", { status: 403, headers: CORS_HEADERS });
  }

  try {
    assertSafeMediaUrl(target);
  } catch {
    return new Response("bad url", { status: 400, headers: CORS_HEADERS });
  }

  const hit = memory.get(target);
  if (hit && Date.now() - hit.at < CACHE_MS) {
    return cached(hit.body, hit.type);
  }

  try {
    const res = await fetch(target, {
      headers: {
        "User-Agent": DEFAULT_UA,
        Accept: "image/avif,image/webp,image/png,image/svg+xml,image/*;q=0.8,*/*;q=0.4",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(4000),
      next: { revalidate: 604800 },
    });
    if (!res.ok) {
      return new Response("upstream", {
        status: 502,
        headers: { ...CORS_HEADERS, "Cache-Control": "public, max-age=60" },
      });
    }
    const finalUrl = res.url || target;
    const contentType = res.headers.get("content-type") || "image/png";
    if (!isImageType(contentType, finalUrl)) {
      return new Response("not image", { status: 502, headers: CORS_HEADERS });
    }
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.byteLength > MAX_BYTES) {
      return new Response("too large", { status: 502, headers: CORS_HEADERS });
    }
    while (memory.size > 600) {
      const first = memory.keys().next().value;
      if (!first) break;
      memory.delete(first);
    }
    memory.set(target, { type: contentType, body: buf, at: Date.now() });
    return cached(buf, contentType);
  } catch {
    return new Response("logo error", {
      status: 502,
      headers: { ...CORS_HEADERS, "Cache-Control": "no-store" },
    });
  }
}
