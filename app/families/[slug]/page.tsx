import { FamilyVarieties } from "./family-varieties";

export default async function DishFamilyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <FamilyVarieties slug={slug} />;
}
