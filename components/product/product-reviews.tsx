import { BadgeCheck, MessageSquare } from "lucide-react";

import { StarRating } from "@/components/product/star-rating";
import { getProductReviews } from "@/lib/data-access";
import { reviewSummary } from "@/lib/reviews";

interface ProductReviewsProps {
  productId: string;
}

export async function ProductReviews({ productId }: ProductReviewsProps) {
  const reviews = await getProductReviews(productId);
  const summary = reviewSummary(reviews);

  return (
    <section aria-labelledby="reviews-heading" className="mt-14">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2
          id="reviews-heading"
          className="text-2xl font-bold tracking-tight"
        >
          Reviews
        </h2>
        {summary.count > 0 ? (
          <>
            <StarRating rating={summary.average} size="md" />
            <p className="text-sm text-muted-foreground">
              {summary.average} · {summary.count} review
              {summary.count === 1 ? "" : "s"}
            </p>
          </>
        ) : null}
      </div>

      {reviews.length === 0 ? (
        <div className="mt-4 flex flex-col items-center gap-2 rounded-lg border bg-muted/40 py-10 text-center">
          <MessageSquare className="size-8 text-muted-foreground" aria-hidden />
          <p className="font-medium">No reviews yet</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Be the first to share what you think of this product.
          </p>
        </div>
      ) : (
        <ul className="mt-4 space-y-4">
          {reviews.map((review) => (
            <li
              key={review.id}
              className="rounded-lg border bg-card p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <StarRating rating={review.rating} />
                  <p className="text-sm font-medium">{review.authorName}</p>
                </div>
                <time
                  dateTime={review.createdAt}
                  className="text-xs text-muted-foreground"
                >
                  {formatReviewDate(review.createdAt)}
                </time>
              </div>
              {review.verified ? (
                <p className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-green-700">
                  <BadgeCheck className="size-4" aria-hidden />
                  Verified Buyer
                </p>
              ) : null}
              <p className="mt-2 text-sm leading-relaxed">{review.comment}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function formatReviewDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
