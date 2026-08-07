"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { Skeleton } from "@/components/ui/skeleton";

export function AuthenticatedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="mx-auto max-w-6xl space-y-4 px-4 py-14">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  return <>{children}</>;
}

export function GuestRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/calculate");
    }
  }, [loading, user, router]);

  if (loading || user) {
    return (
      <div className="mx-auto max-w-md space-y-4 px-4 py-14">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  return <>{children}</>;
}
