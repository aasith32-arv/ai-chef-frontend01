import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calculate ingredients",
  description:
    "Select a dish and guest count to calculate exact ingredient quantities with AI Chef.",
};

export default function CalculateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
