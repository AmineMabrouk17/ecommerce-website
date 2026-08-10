"use client";

import { ChevronDown, ChevronUp, ImagePlus, Loader2, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  addProductImage,
  buildProductImagePath,
  isAcceptedProductImage,
  MAX_PRODUCT_IMAGE_BYTES,
  MAX_PRODUCT_IMAGES,
  moveProductImage,
  removeProductImageAt,
} from "@/lib/products-form";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface ProductImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
}

function humanReadableBytes(bytes: number): string {
  return `${Math.round(bytes / 1024 / 1024)} MB`;
}

export function ProductImageUpload({ images, onChange }: ProductImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function uploadFiles(files: File[]) {
    if (uploading) return;
    setError(null);

    const accepted = files.filter(isAcceptedProductImage);
    if (accepted.length === 0) {
      setError(
        `Please choose image files up to ${humanReadableBytes(
          MAX_PRODUCT_IMAGE_BYTES,
        )} each.`,
      );
      return;
    }
    if (images.length + accepted.length > MAX_PRODUCT_IMAGES) {
      setError(`You can add at most ${MAX_PRODUCT_IMAGES} images.`);
      return;
    }

    const supabase = createClient();
    setUploading(true);
    const uploaded: string[] = [];
    try {
      for (const file of accepted) {
        const path = buildProductImagePath(file.name);
        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(path, file, { upsert: false });
        if (uploadError) {
          setError("We could not upload your images. Please try again.");
          break;
        }
        const { data } = supabase.storage
          .from("product-images")
          .getPublicUrl(path);
        uploaded.push(data.publicUrl);
      }
    } finally {
      setUploading(false);
    }

    if (uploaded.length > 0) {
      onChange(uploaded.reduce((acc, url) => addProductImage(acc, url), images));
    }
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    void uploadFiles(files);
  }

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload product images"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void uploadFiles(Array.from(event.dataTransfer.files));
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors",
          dragging
            ? "border-primary bg-primary/5"
            : "border-input bg-muted/30 hover:bg-muted/50",
        )}
      >
        {uploading ? (
          <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden />
        ) : (
          <ImagePlus className="size-6 text-muted-foreground" aria-hidden />
        )}
        <p className="text-sm font-medium">
          {uploading ? "Uploading…" : "Drag and drop images here"}
        </p>
        <p className="text-xs text-muted-foreground">
          or click to browse · PNG, JPG up to{" "}
          {humanReadableBytes(MAX_PRODUCT_IMAGE_BYTES)} each · max{" "}
          {MAX_PRODUCT_IMAGES} images
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={handleInputChange}
        />
      </div>

      {error ? (
        <p
          role="alert"
          className="text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}

      {images.length > 0 ? (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((image, index) => (
            <li
              key={image}
              className="group relative overflow-hidden rounded-lg border bg-muted"
            >
              <Image
                src={image}
                alt={`Product image ${index + 1}`}
                width={120}
                height={120}
                unoptimized
                className="aspect-square size-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/60 to-transparent p-1.5">
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={index === 0}
                    onClick={() => onChange(moveProductImage(images, index, index - 1))}
                    aria-label={`Move image ${index + 1} left`}
                    className="size-7 text-white hover:bg-white/20 hover:text-white"
                  >
                    <ChevronUp className="size-4" aria-hidden />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={index === images.length - 1}
                    onClick={() => onChange(moveProductImage(images, index, index + 1))}
                    aria-label={`Move image ${index + 1} right`}
                    className="size-7 text-white hover:bg-white/20 hover:text-white"
                  >
                    <ChevronDown className="size-4" aria-hidden />
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onChange(removeProductImageAt(images, index))}
                  aria-label={`Remove image ${index + 1}`}
                  className="size-7 text-white hover:bg-white/20 hover:text-white"
                >
                  <X className="size-4" aria-hidden />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
