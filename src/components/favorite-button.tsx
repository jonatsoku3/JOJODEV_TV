"use client";

import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLibrary } from "@/hooks/use-library";
import { COPY } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function FavoriteButton({ id, className }: { id: string; className?: string }) {
  const { ready, isFavorite, toggleFavorite } = useLibrary();
  const active = ready && isFavorite(id);

  return (
    <Button
      type="button"
      variant={active ? "default" : "outline"}
      className={cn("rounded-full", className)}
      onClick={() => toggleFavorite(id)}
    >
      <Heart className={cn("size-4", active && "fill-current")} />
      {active ? COPY.removeFavorite : COPY.addFavorite}
    </Button>
  );
}
