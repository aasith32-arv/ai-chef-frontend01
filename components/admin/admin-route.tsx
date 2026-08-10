"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/auth/login");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="container-premium space-y-4 py-12">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-80 w-full rounded-3xl" />
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="container-premium flex min-h-[60vh] items-center justify-center py-12">
        <div className="card-premium max-w-lg space-y-4 p-8 text-center">
          <ShieldAlert className="mx-auto size-12 text-destructive" />
          <h1 className="text-2xl font-extrabold">Administrator access required</h1>
          <p className="text-muted-foreground">
            Your account is signed in, but it does not have permission to manage AI Chef.
          </p>
          <Button asChild>
            <Link href="/">Return to AI Chef</Link>
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
