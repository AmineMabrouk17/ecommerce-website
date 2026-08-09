import { PackageSearch } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function EmptyState() {
  return (
    <Card className="mt-10">
      <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
        <PackageSearch className="size-10 text-muted-foreground" aria-hidden />
        <div>
          <h2 className="text-lg font-semibold">No products found</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your search or filters.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/catalog">Clear all filters</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
