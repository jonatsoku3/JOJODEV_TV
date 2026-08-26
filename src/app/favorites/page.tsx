import { FavoritesView } from "@/components/favorites-view";
import { PageShell } from "@/components/page-shell";
import { COPY } from "@/lib/i18n";

export const metadata = { title: COPY.favorites };

export default function FavoritesPage() {
  return (
    <PageShell className="space-y-6">
      <div>
        <p className="text-sm font-medium text-amber-200">{COPY.tagline}</p>
        <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          {COPY.favorites}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{COPY.emptyFavoritesBody}</p>
      </div>
      <FavoritesView />
    </PageShell>
  );
}
