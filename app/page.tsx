import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <Sparkles className="size-10 text-primary" aria-hidden />
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          {siteConfig.name}
        </h1>
        <p className="mt-2 text-muted-foreground">{siteConfig.description}</p>
      </div>
      <Button asChild>
        <a href="/">Shop now</a>
      </Button>
    </main>
  );
}
