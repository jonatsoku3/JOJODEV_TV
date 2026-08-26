import { getCatalog } from "@/lib/catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const catalog = await getCatalog();
    return Response.json({ ok: true, stats: catalog.stats });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unhealthy";
    return Response.json({ ok: false, error: message }, { status: 503 });
  }
}
