import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Choose AI Chef Premium or purchase an advertising package securely through Stripe.",
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
