import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Saved recipes",
  description: "Your favorite AI Chef recipes saved in this browser.",
};

export default function SavedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
