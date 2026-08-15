import { NewsletterForm } from "@/components/home/newsletter-form";

export function NewsletterBand() {
  return (
    <section className="border-t bg-gradient-to-br from-primary/10 via-background to-violet/10">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-balance font-display text-3xl font-semibold tracking-tight">
            Join the <em className="text-primary italic">Lumina</em> list
          </h2>
          <p className="mt-2 text-muted-foreground">
            New drops, restocks, and early access. No spam, ever.
          </p>
          <NewsletterForm />
        </div>
      </div>
    </section>
  );
}
