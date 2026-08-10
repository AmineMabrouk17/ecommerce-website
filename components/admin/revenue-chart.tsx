"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { DailyRevenuePoint } from "@/lib/analytics";
import { formatPrice } from "@/lib/money";

const chartConfig = {
  revenueCents: {
    label: "Revenue",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

function formatChartDate(value: string, options: Intl.DateTimeFormatOptions) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", options);
}

export function RevenueChart({ data }: { data: DailyRevenuePoint[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue</CardTitle>
        <CardDescription>Daily revenue over the last 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[260px] w-full">
          <LineChart
            data={data}
            margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value: string) =>
                formatChartDate(value, {
                  month: "short",
                  day: "numeric",
                })
              }
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={64}
              tickFormatter={(value: number) => formatPrice(Number(value))}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="line"
                  formatter={(value) => (
                    <span className="font-mono font-medium tabular-nums text-foreground">
                      {formatPrice(Number(value))}
                    </span>
                  )}
                  labelFormatter={(label) =>
                    formatChartDate(String(label), {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })
                  }
                />
              }
            />
            <Line
              dataKey="revenueCents"
              type="monotone"
              stroke="var(--color-revenueCents)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
