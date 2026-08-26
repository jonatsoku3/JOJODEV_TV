import { FavoritesView } from "@/components/favorites-view";
import { COPY } from "@/lib/i18n";

export const metadata = { title: COPY.favorites };

export default function FavoritesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">{COPY.favorites}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{COPY.emptyFavoritesBody}</p>
      </div>
      <FavoritesView />
    </div>
  );
}
