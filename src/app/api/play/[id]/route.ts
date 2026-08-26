import { getCatalog, getChannel } from "@/lib/catalog";
import {
  CORS_HEADERS,
  DEFAULT_UA,
  fetchUpstream,
  looksLikePlaylist,
  rewritePlaylist,
} from "@/lib/media";
import { mediaPath } from "@/lib/signing";
import type { StreamSource } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

function streamHeaders(stream: StreamSource) {
  const ua = stream.userAgent || DEFAULT_UA;
  const referrer =
    stream.referrer ||
    (() => {
      try {
        return new URL(stream.url).origin + "/";
      } catch {
        return undefined;
      }
    })();
  return { ua, referrer };
}

async function playStream(stream: StreamSource, requestUrl: string) {
  const { ua, referrer } = streamHeaders(stream);
  const { res, finalUrl } = await fetchUpstream(stream.url, { ua, referrer, timeoutMs: 8000 });
  if (!res.ok && res.status !== 206) return null;
  const contentType = res.headers.get("content-type");
  const buf = Buffer.from(await res.arrayBuffer());
  const start = buf.subarray(0, 16).toString("utf8");
  if (looksLikePlaylist(finalUrl, contentType, start)) {
    const rewritten = rewritePlaylist(buf.toString("utf8"), finalUrl, { ua, referrer });
    return new Response(rewritten, {
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "application/vnd.apple.mpegurl",
        "Cache-Control": "no-store",
      },
    });
  }
  return Response.redirect(new URL(mediaPath({ url: stream.url, ua, referrer }), requestUrl), 302);
}

export async function GET(request: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const catalog = await getCatalog();
    const channel = getChannel(catalog, id);
    if (!channel?.streams.length) {
      return Response.json({ error: "not found" }, { status: 404, headers: CORS_HEADERS });
    }
    const requested = Math.max(0, Number(new URL(request.url).searchParams.get("i") || 0));
    const start = requested % channel.streams.length;
    const order = [
      ...channel.streams.slice(start),
      ...channel.streams.slice(0, start),
    ];

    let lastError = "no stream";
    for (const stream of order) {
      try {
        const response = await playStream(stream, request.url);
        if (response) return response;
        lastError = "upstream error";
      } catch (error) {
        lastError = error instanceof Error ? error.message : "play error";
      }
    }

    return Response.json({ error: lastError }, { status: 502, headers: CORS_HEADERS });
  } catch (error) {
    const message = error instanceof Error ? error.message : "play error";
    return Response.json({ error: message }, { status: 502, headers: CORS_HEADERS });
  }
}
