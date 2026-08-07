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
  full_name: z.string().optional(),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  return (
    <GuestRoute>
      <RegisterForm />
    </GuestRoute>
  );
}

function RegisterForm() {
  const { register: registerUser } = useAuth();
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
      await registerUser({
        username: values.username,
        email: values.email,
        password: values.password,
        full_name: values.full_name || undefined,
      });
      toast.success("Account created");
      router.push("/calculate");
    } catch (error) {
      toast.error(getErrorMessage(error, "Registration failed"));
    }
  }

  return (
    <div className="container-premium grid min-h-[70vh] items-center gap-8 py-10 lg:grid-cols-2 lg:py-16">
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        className="relative hidden min-h-[560px] overflow-hidden rounded-[2rem] shadow-float lg:block"
      >
        <Image
          src={foodHeroImage()}
          alt="Fresh ingredients"
          fill
          className="object-cover"
          sizes="50vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
        <div className="absolute bottom-8 left-8 right-8 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">
            Join AI Chef
          </p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight">
            Save favorites and scale recipes anywhere
          </h2>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel mx-auto w-full max-w-md rounded-[2rem] border border-border/70 p-6 sm:p-8"
      >
        <h1 className="text-3xl font-extrabold tracking-tight">Create account</h1>
        <p className="mt-2 text-muted-foreground">
          Start saving dishes and syncing your kitchen plans.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full name</Label>
            <Input id="full_name" className="h-11 rounded-2xl" {...register("full_name")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" className="h-11 rounded-2xl" {...register("username")} />
            {errors.username && (
              <p className="text-sm text-destructive">{errors.username.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" className="h-11 rounded-2xl" {...register("email")} />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
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
            {isSubmitting ? "Creating…" : "Create account"}
          </Button>
        </form>

        <p className="mt-6 text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
