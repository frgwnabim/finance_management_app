import type { Metadata } from "next";

import { CategoryManager } from "@/components/categories/category-manager";
import { getCategoriesWithUsage } from "@/lib/data/categories";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Categories" };

export default async function CategoriesPage() {
  const user = await requireUser();
  const categories = await getCategoriesWithUsage(user.id);

  return <CategoryManager categories={categories} />;
}
