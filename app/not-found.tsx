import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-premium flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-primary">
        404
      </p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
        Page not found
      </h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        That recipe or page doesn&apos;t exist. Head home or scale a dish
        instead.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild className="rounded-full shadow-premium">
          <Link href="/">Go home</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/calculate">Calculate quantities</Link>
        </Button>
      </div>
    </div>
  );
}
