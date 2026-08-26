import { getCatalog, getChannel, relatedChannels } from "@/lib/catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const catalog = await getCatalog();
    const channel = getChannel(catalog, decodeURIComponent(id));
    if (!channel) {
      return Response.json({ error: "not found" }, { status: 404 });
    }
    return Response.json({
      channel,
      related: relatedChannels(catalog, channel),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "catalog error";
    return Response.json({ error: message }, { status: 503 });
  }
}
