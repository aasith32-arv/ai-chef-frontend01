import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Suggest a recipe",
  description:
    "Enter available ingredients and get recipe suggestions ranked by fit.",
};

export default function SuggestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
