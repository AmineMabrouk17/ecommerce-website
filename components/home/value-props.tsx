import { BadgeCheck, ShieldCheck, Truck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

function ValueProp({
  icon: Icon,
  title,
  copy,
}: {
  icon: LucideIcon;
  title: string;
  copy: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="size-5" aria-hidden />
      </span>
      <div>
        <h3 className="font-display text-base font-semibold">{title}</h3>
        <p className="mt-0.5 text-sm text-muted-foreground">{copy}</p>
      </div>
    </div>
  );
}

export function ValueProps() {
  return (
    <section className="border-y bg-secondary/40">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:grid-cols-3 sm:px-6 lg:px-8">
        <ValueProp
          icon={Truck}
          title="Free shipping over $50"
          copy="Flat $5 below the threshold, free above."
        />
        <ValueProp
          icon={ShieldCheck}
          title="Secure checkout"
          copy="Payments processed safely with Stripe."
        />
        <ValueProp
          icon={BadgeCheck}
          title="Verified reviews"
          copy="Feedback only from confirmed buyers."
        />
      </div>
    </section>
  );
}
