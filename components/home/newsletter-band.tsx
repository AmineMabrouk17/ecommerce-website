import Image from "next/image";
import { NewsletterForm } from "@/components/home/newsletter-form";
import { MotionDiv } from "@/lib/motion";

export function NewsletterBand() {
  return (
    <section className="relative overflow-hidden">
      <Image
        src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80"
        alt=""
        fill
        className="object-cover"
        sizes="100vw"
        priority={false}
      />
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <MotionDiv
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mx-auto max-w-xl text-center"
        >
          <h2 className="text-balance font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Join the <em className="text-primary italic">Lumina</em> list
          </h2>
          <p className="mt-3 text-base text-white/80">
            New drops, restocks, and early access. No spam, ever.
          </p>
          <NewsletterForm />
        </MotionDiv>
      </div>
    </section>
  );
}
