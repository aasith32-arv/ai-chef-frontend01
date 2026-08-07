import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Calculator, Sparkles, Users, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { foodHeroImage } from "@/lib/food-images";

export const metadata: Metadata = {
  title: "About",
  description:
    "Why AI Chef exists — solving the ingredient quantity gap for home cooks and caterers.",
};

const AUDIENCE = [
  "Home cooks planning parties and festivals",
  "Students and small caterers who need reliable batch sizes",
  "Anyone tired of overbuying — or running out mid-cook",
];

export default function AboutPage() {
  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={foodHeroImage()}
            alt="Chef preparing food"
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/55 to-black/30" />
        </div>
        <div className="container-premium relative py-20 sm:py-28">
          <Badge className="mb-4 rounded-full bg-white/15 text-white backdrop-blur-md">
            <Sparkles className="mr-1 size-3.5 text-accent" />
            About the product
          </Badge>
          <h1 className="max-w-2xl text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            About AI Chef
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-white/85">
            Cooking for a crowd shouldn&apos;t mean guessing grams or doubling a
            recipe until something burns or runs short.
          </p>
        </div>
      </section>

      <div className="container-premium space-y-10 py-12 sm:py-16">
        <div className="grid gap-5 md:grid-cols-2">
          <article className="card-premium space-y-3 p-6 sm:p-7">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Users className="size-5" />
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">The problem</h2>
            <p className="leading-relaxed text-muted-foreground">
              Recipe apps are great for inspiration, but most lock you into a
              fixed serving size. Scaling for 25 guests — or 100 for a community
              meal — becomes mental math, sticky notes, and wasted ingredients.
            </p>
          </article>
          <article className="card-premium space-y-3 p-6 sm:p-7">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Calculator className="size-5" />
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">The solution</h2>
            <p className="leading-relaxed text-muted-foreground">
              AI Chef is a smart food quantity calculator and recipe assistant.
              Pick a dish, set your guest count, and get exact ingredient
              quantities. Or list what&apos;s in your kitchen and get recipes
              ranked by fit.
            </p>
          </article>
        </div>

        <section className="card-premium space-y-4 bg-surface p-6 sm:p-8">
          <h2 className="text-2xl font-extrabold tracking-tight">Who it&apos;s for</h2>
          <ul className="grid gap-3 sm:grid-cols-3">
            {AUDIENCE.map((item) => (
              <li
                key={item}
                className="rounded-2xl border border-border bg-card p-4 text-sm font-medium leading-relaxed"
              >
                {item}
              </li>
            ))}
          </ul>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="rounded-full shadow-premium">
            <Link href="/calculate">
              <Calculator className="size-4" />
              Try the calculator
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full">
            <Link href="/suggest">
              <Wand2 className="size-4" />
              Suggest from my pantry
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
