"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitReview } from "@/lib/actions/reviews";
import { reviewFormSchema, type ReviewFormInput } from "@/lib/reviews";
import { cn } from "@/lib/utils";

const RATING_OPTIONS = [1, 2, 3, 4, 5];

interface ReviewDialogProps {
  productId: string;
  productTitle: string;
}

export function ReviewDialog({ productId, productTitle }: ReviewDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReviewFormInput>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: { productId, rating: 0, comment: "" },
  });

  function onSubmit(values: ReviewFormInput) {
    setError(null);
    startTransition(async () => {
      const result = await submitReview(values);
      if (result.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      reset();
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          Write a review
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <DialogHeader>
            <DialogTitle>Write a review</DialogTitle>
            <DialogDescription>{productTitle}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Your rating</Label>
              <Controller
                control={control}
                name="rating"
                render={({ field }) => (
                  <div
                    role="radiogroup"
                    aria-label="Rating"
                    className="flex items-center gap-1"
                  >
                    {RATING_OPTIONS.map((value) => (
                      <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={field.value >= value}
                        aria-label={`${value} star${value === 1 ? "" : "s"}`}
                        onClick={() => field.onChange(value)}
                        className="cursor-pointer p-0.5 text-muted-foreground transition-colors hover:text-amber-400"
                      >
                        <Star
                          className={cn(
                            "size-6",
                            field.value >= value &&
                              "fill-amber-400 text-amber-400",
                          )}
                        />
                      </button>
                    ))}
                  </div>
                )}
              />
              {errors.rating && (
                <p className="text-sm text-destructive">{errors.rating.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Comment</Label>
              <Textarea
                id="comment"
                placeholder="What did you like or dislike?"
                aria-invalid={Boolean(errors.comment)}
                {...register("comment")}
              />
              {errors.comment && (
                <p className="text-sm text-destructive">{errors.comment.message}</p>
              )}
            </div>

            {error ? (
              <p
                role="alert"
                className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {error}
              </p>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setOpen(false);
                reset();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="size-4 animate-spin" />}
              Submit review
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
