"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { GuestRoute } from "@/components/auth-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getErrorMessage, useAuth } from "@/providers/auth-provider";
import { foodHeroImage } from "@/lib/food-images";

const schema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  return (
    <GuestRoute>
      <LoginForm />
    </GuestRoute>
  );
}

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(values: FormValues) {
    try {
      await login(values.email, values.password);
      toast.success("Welcome back");
      router.push("/calculate");
    } catch (error) {
      toast.error(getErrorMessage(error, "Login failed"));
    }
  }

  return (
    <div className="container-premium grid min-h-[70vh] items-center gap-8 py-10 lg:grid-cols-2 lg:py-16">
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        className="relative hidden min-h-[520px] overflow-hidden rounded-[2rem] shadow-float lg:block"
      >
        <Image
          src={foodHeroImage()}
          alt="Premium kitchen"
          fill
          className="object-cover"
          sizes="50vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-8 left-8 right-8 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">
            AI Chef
          </p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight">
            Cook with confidence for every guest count
          </h2>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel mx-auto w-full max-w-md rounded-[2rem] border border-border/70 p-6 sm:p-8"
      >
        <h1 className="text-3xl font-extrabold tracking-tight">Sign in</h1>
        <p className="mt-2 text-muted-foreground">
          Save favorites and sync them across sessions.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              className="h-11 rounded-2xl"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              className="h-11 rounded-2xl"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
          <Button
            type="submit"
            className="h-11 w-full rounded-full shadow-premium"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <p className="mt-6 text-sm text-muted-foreground">
          No account?{" "}
          <Link
            href="/auth/register"
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
