import { getCatalog, queryChannels } from "@/lib/catalog";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const catalog = await getCatalog();
    const sp = request.nextUrl.searchParams;
    const ids = sp.get("ids")?.split(",").map((s) => decodeURIComponent(s.trim())).filter(Boolean);
    const result = queryChannels(catalog, {
      q: sp.get("q") ?? undefined,
      country: sp.get("country") ?? undefined,
      category: sp.get("category") ?? undefined,
      ids,
      offset: Number(sp.get("offset") || 0),
      limit: Number(sp.get("limit") || 48),
    });
    return Response.json(result, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "catalog error";
    return Response.json({ error: message }, { status: 503 });
  }
}
