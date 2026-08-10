"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { toggleProductField } from "@/lib/actions/admin-products";
import type { AdminProductToggleField } from "@/lib/products-admin";
import { Switch } from "@/components/ui/switch";

interface ProductToggleProps {
  productId: string;
  field: AdminProductToggleField;
  checked: boolean;
  label: string;
}

export function ProductToggle({
  productId,
  field,
  checked,
  label,
}: ProductToggleProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(checked);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setValue(checked);
  }, [checked]);

  const handleCheckedChange = (next: boolean) => {
    setValue(next);
    setError(null);
    startTransition(async () => {
      const result = await toggleProductField({ productId, field, value: next });
      if (result.error) {
        setValue(checked);
        setError(result.error);
        return;
      }
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <Switch
        checked={value}
        onCheckedChange={handleCheckedChange}
        disabled={isPending}
        aria-label={label}
      />
      {error ? (
        <span className="max-w-32 text-xs leading-tight text-destructive">
          {error}
        </span>
      ) : null}
    </div>
  );
}
