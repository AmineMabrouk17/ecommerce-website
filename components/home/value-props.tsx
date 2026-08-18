import { BadgeCheck, Headphones, ShieldCheck, Truck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { MotionDiv } from "@/lib/motion";

function ValueProp({
  icon: Icon,
  title,
  copy,
  index,
}: {
  icon: LucideIcon;
  title: string;
  copy: string;
  index: number;
}) {
  return (
    <MotionDiv
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
      className="flex items-start gap-3"
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="size-5" aria-hidden />
      </span>
      <div>
        <h3 className="font-display text-base font-semibold">{title}</h3>
        <p className="mt-0.5 text-sm text-muted-foreground">{copy}</p>
      </div>
    </MotionDiv>
  );
}

const props = [
  {
    icon: Truck,
    title: "Free shipping over $50",
    copy: "Flat $5 below the threshold, free above.",
  },
  {
    icon: ShieldCheck,
    title: "Secure checkout",
    copy: "Payments processed safely with Stripe.",
  },
  {
    icon: BadgeCheck,
    title: "Verified reviews",
    copy: "Feedback only from confirmed buyers.",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    copy: "Reach us anytime via chat or email.",
  },
] as const;

export function ValueProps() {
  return (
    <section className="border-y bg-secondary/40">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:grid-cols-2 sm:px-6 md:grid-cols-4 lg:px-8">
        {props.map((prop, i) => (
          <ValueProp key={prop.title} {...prop} index={i} />
        ))}
      </div>
    </section>
  );
}
