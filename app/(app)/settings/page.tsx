import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CategoryManager } from "@/components/category-manager";
import type { Category } from "@/lib/types";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const { data: categories } = await supabase
    .from("categories")
    .select("*, ingredients(count)")
    .order("name");

  const ingredientCounts: Record<string, number> = {};
  for (const cat of categories ?? []) {
    ingredientCounts[cat.id] = cat.ingredients?.[0]?.count ?? 0;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Manage the ingredient categories you want to flag when scanning labels.
      </p>
      <div className="mt-8">
        <CategoryManager
          initialCategories={(categories as Category[]) ?? []}
          ingredientCounts={ingredientCounts}
          userId={user.id}
        />
      </div>
    </div>
  );
}
