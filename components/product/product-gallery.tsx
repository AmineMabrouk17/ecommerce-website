"use client";

import Image from "next/image";
import { useCallback, useRef, useState, type MouseEvent } from "react";

import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
  name: string;
}

export function ProductGallery({ images, name }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  const activeImage = images[activeIndex] ?? null;
  const hasMultiple = images.length > 1;

  const handleMove = useCallback((event: MouseEvent<HTMLDivElement>) => {
    const frame = frameRef.current;
    if (!frame) return;
    const rect = frame.getBoundingClientRect();
    setZoom({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    });
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div
        ref={frameRef}
        onMouseMove={handleMove}
        onMouseLeave={() => setZoom(null)}
        className="group relative aspect-square overflow-hidden rounded-xl border bg-muted"
      >
        {activeImage ? (
          <Image
            src={activeImage}
            alt={name}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className={cn(
              "object-cover transition-transform duration-200",
              zoom !== null && "scale-[1.75]",
            )}
            style={
              zoom !== null
                ? { transformOrigin: `${zoom.x}% ${zoom.y}%` }
                : undefined
            }
          />
        ) : null}
      </div>
      {hasMultiple ? (
        <div className="flex gap-3">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              aria-label={`View image ${index + 1} of ${name}`}
              aria-pressed={index === activeIndex}
              onClick={() => setActiveIndex(index)}
              className={cn(
                "relative aspect-square w-20 overflow-hidden rounded-lg border bg-muted",
                index === activeIndex
                  ? "border-primary ring-2 ring-primary"
                  : "border-border hover:border-foreground/40",
              )}
            >
              <Image src={image} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
