import { getCatalog } from "@/lib/catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const catalog = await getCatalog();
    return Response.json(
      {
        stats: catalog.stats,
        countries: catalog.countries,
        categories: catalog.categories,
      },
      { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600" } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "catalog error";
    return Response.json({ error: message }, { status: 503 });
  }
}
