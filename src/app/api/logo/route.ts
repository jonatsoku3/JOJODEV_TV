import { CORS_HEADERS, DEFAULT_UA, assertSafeMediaUrl, fetchUpstream } from "@/lib/media";
import { verifyLogo } from "@/lib/signing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 900_000;
const cache = new Map<string, { type: string; body: Uint8Array; at: number }>();
const CACHE_MS = 6 * 60 * 60 * 1000;

function isImageType(type: string | null, url: string) {
  const value = (type || "").toLowerCase();
  if (value.startsWith("image/")) return true;
  if (value.includes("svg")) return true;
  return /\.(svg|png|jpe?g|webp|gif|avif|ico)(\?|$)/i.test(url);
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

  const hit = cache.get(target);
  if (hit && Date.now() - hit.at < CACHE_MS) {
    return new Response(Buffer.from(hit.body), {
      headers: {
        ...CORS_HEADERS,
        "Content-Type": hit.type,
        "Cache-Control": "public, max-age=604800, s-maxage=604800, stale-while-revalidate=86400",
      },
    });
  }

  try {
    const { res, finalUrl } = await fetchUpstream(target, {
      ua: DEFAULT_UA,
      timeoutMs: 4500,
    });
    if (!res.ok) {
      return new Response("upstream", { status: 502, headers: CORS_HEADERS });
    }
    const contentType = res.headers.get("content-type") || "image/png";
    if (!isImageType(contentType, finalUrl)) {
      return new Response("not image", { status: 502, headers: CORS_HEADERS });
    }
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.byteLength > MAX_BYTES) {
      return new Response("too large", { status: 502, headers: CORS_HEADERS });
    }
    if (cache.size > 180) {
      const first = cache.keys().next().value;
      if (first) cache.delete(first);
    }
    cache.set(target, { type: contentType, body: buf, at: Date.now() });
    return new Response(buf, {
      headers: {
        ...CORS_HEADERS,
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=604800, s-maxage=604800, stale-while-revalidate=86400",
      },
    });
  } catch {
    return new Response("logo error", { status: 502, headers: CORS_HEADERS });
  }
}
