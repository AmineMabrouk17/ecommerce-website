import { DollarSign, Receipt, ShoppingBag, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AdminKpis } from "@/lib/analytics";
import { formatPrice } from "@/lib/money";

interface KpiCardConfig {
  label: string;
  value: string;
  hint: string;
  Icon: LucideIcon;
}

function kpiCards(kpis: AdminKpis): KpiCardConfig[] {
  return [
    {
      label: "Total revenue",
      value: formatPrice(kpis.totalRevenue),
      hint: "All paid orders",
      Icon: DollarSign,
    },
    {
      label: "30-day revenue",
      value: formatPrice(kpis.revenue30d),
      hint: "Last 30 days",
      Icon: TrendingUp,
    },
    {
      label: "Orders",
      value: String(kpis.orderCount),
      hint: "All paid orders",
      Icon: ShoppingBag,
    },
    {
      label: "Average order value",
      value: formatPrice(kpis.averageOrderValue30d),
      hint: "30-day revenue per order",
      Icon: Receipt,
    },
  ];
}

export function KpiCards({ kpis }: { kpis: AdminKpis }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {kpiCards(kpis).map((card) => (
        <Card key={card.label}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.label}
            </CardTitle>
            <card.Icon className="size-4 text-muted-foreground" aria-hidden />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{card.value}</div>
            <p className="mt-1 text-xs text-muted-foreground">{card.hint}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
