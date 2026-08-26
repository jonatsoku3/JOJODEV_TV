import { getCatalog, getChannel } from "@/lib/catalog";
import { CORS_HEADERS, DEFAULT_UA, fetchUpstream, looksLikePlaylist, rewritePlaylist } from "@/lib/media";
import { mediaPath } from "@/lib/signing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(request: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const catalog = await getCatalog();
    const channel = getChannel(catalog, decodeURIComponent(id));
    if (!channel) {
      return Response.json({ error: "not found" }, { status: 404, headers: CORS_HEADERS });
    }
    const index = Math.max(0, Number(new URL(request.url).searchParams.get("i") || 0));
    const stream = channel.streams[index] ?? channel.streams[0];
    if (!stream) {
      return Response.json({ error: "no stream" }, { status: 404, headers: CORS_HEADERS });
    }

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
    const { res, finalUrl } = await fetchUpstream(stream.url, { ua, referrer });
    if (!res.ok && res.status !== 206) {
      return Response.json(
        { error: `upstream ${res.status}` },
        { status: 502, headers: CORS_HEADERS }
      );
    }

    const contentType = res.headers.get("content-type");
    const buf = Buffer.from(await res.arrayBuffer());
    const start = buf.subarray(0, 16).toString("utf8");
    if (looksLikePlaylist(finalUrl, contentType, start)) {
      const text = buf.toString("utf8");
      const rewritten = rewritePlaylist(text, finalUrl, { ua, referrer });
      return new Response(rewritten, {
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "application/vnd.apple.mpegurl",
          "Cache-Control": "no-store",
        },
      });
    }

    return Response.redirect(
      new URL(mediaPath({ url: stream.url, ua, referrer }), request.url),
      302
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "play error";
    return Response.json({ error: message }, { status: 502, headers: CORS_HEADERS });
  }
}
