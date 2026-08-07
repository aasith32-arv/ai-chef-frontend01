"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Calculator,
  Heart,
  Languages,
  LogOut,
  Sparkles,
  UserRound,
} from "lucide-react";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/providers/auth-provider";
import { foodHeroImage } from "@/lib/food-images";

export default function ProfilePage() {
  return (
    <AuthenticatedRoute>
      <ProfileContent />
    </AuthenticatedRoute>
  );
}

function ProfileContent() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) return null;

  return (
    <div className="container-premium py-10 sm:py-14">
      <div className="card-premium overflow-hidden">
        <div className="relative h-40 sm:h-52">
          <Image
            src={foodHeroImage()}
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
        </div>

        <div className="relative -mt-12 px-5 pb-8 sm:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <div className="flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-secondary text-2xl font-extrabold text-primary-foreground shadow-float ring-4 ring-card">
                {user.username.slice(0, 1).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                  {user.full_name || user.username}
                </h1>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <Badge className="mt-2 rounded-full bg-primary/10 text-primary">
                  <Sparkles className="mr-1 size-3" />
                  AI Chef member
                </Badge>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              { label: "Username", value: user.username, icon: UserRound },
              { label: "Joined", value: new Date(user.created_at).toLocaleDateString(), icon: Heart },
              { label: "Language", value: "EN / TA / SI", icon: Languages },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-3xl border border-border bg-surface/80 p-4"
              >
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <stat.icon className="size-3.5 text-primary" />
                  {stat.label}
                </div>
                <p className="font-bold">{stat.value}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild className="rounded-full shadow-premium">
              <Link href="/calculate">
                <Calculator className="size-4" />
                Calculate
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/shopping-list">Shopping list</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/saved">
                <Heart className="size-4" />
                Saved recipes
              </Link>
            </Button>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => {
                void logout().then(() => router.push("/"));
              }}
            >
              <LogOut className="size-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
