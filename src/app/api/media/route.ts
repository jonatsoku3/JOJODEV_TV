import {
  CORS_HEADERS,
  DEFAULT_UA,
  fetchUpstream,
  looksLikePlaylist,
  rewritePlaylist,
} from "@/lib/media";
import { verifyMedia } from "@/lib/signing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const target = url.searchParams.get("u") || "";
  const exp = url.searchParams.get("exp") || "";
  const sig = url.searchParams.get("sig") || "";
  const ua = url.searchParams.get("a") || undefined;
  const referrer = url.searchParams.get("r") || undefined;

  if (!verifyMedia({ url: target, ua, referrer, exp, sig })) {
    return Response.json({ error: "invalid signature" }, { status: 403, headers: CORS_HEADERS });
  }

  try {
    const playlistHint = looksLikePlaylist(target, null, "");
    const range = playlistHint ? null : request.headers.get("range");
    const { res, finalUrl } = await fetchUpstream(target, {
      ua: ua || DEFAULT_UA,
      referrer,
      range,
    });

    if (!res.ok && res.status !== 206) {
      return new Response(`upstream ${res.status}`, {
        status: 502,
        headers: CORS_HEADERS,
      });
    }

    const contentType = res.headers.get("content-type");
    const buf = Buffer.from(await res.arrayBuffer());
    const start = buf.subarray(0, 16).toString("utf8");

    if (looksLikePlaylist(finalUrl, contentType, start)) {
      const rewritten = rewritePlaylist(buf.toString("utf8"), finalUrl, { ua, referrer });
      return new Response(rewritten, {
        status: 200,
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "application/vnd.apple.mpegurl",
          "Cache-Control": "no-store",
        },
      });
    }

    const headers = new Headers(CORS_HEADERS);
    headers.set("Cache-Control", "public, max-age=15");
    if (contentType) headers.set("Content-Type", contentType);
    headers.set("Content-Length", String(buf.byteLength));
    const cr = res.headers.get("content-range");
    const ar = res.headers.get("accept-ranges");
    if (cr) headers.set("Content-Range", cr);
    if (ar) headers.set("Accept-Ranges", ar);
    else headers.set("Accept-Ranges", "bytes");

    return new Response(buf, { status: res.status, headers });
  } catch (error) {
    const message = error instanceof Error ? error.message : "media error";
    return Response.json({ error: message }, { status: 502, headers: CORS_HEADERS });
  }
}
