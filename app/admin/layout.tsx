import type { Metadata } from "next";
import { AdminRoute } from "@/components/admin/admin-route";
import { AdminShell } from "@/components/admin/admin-shell";

export const metadata: Metadata = {
  title: "Admin Console",
  description: "Secure AI Chef catalog and account management.",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminRoute><AdminShell>{children}</AdminShell></AdminRoute>;
}
