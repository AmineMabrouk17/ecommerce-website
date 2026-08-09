import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  size?: "sm" | "md";
}

export function StarRating({ rating, size = "sm" }: StarRatingProps) {
  const value = Math.round(rating);
  return (
    <div
      role="img"
      aria-label={`${rating} out of 5 stars`}
      className="flex items-center gap-0.5"
    >
      {[1, 2, 3, 4, 5].map((position) => (
        <Star
          key={position}
          className={cn(
            size === "sm" ? "size-3.5" : "size-5",
            position <= value
              ? "fill-amber-400 text-amber-400"
              : "text-muted-foreground/40",
          )}
          aria-hidden
        />
      ))}
    </div>
  );
}
