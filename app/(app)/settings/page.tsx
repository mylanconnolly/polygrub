import { createClient } from "@/lib/supabase/server";
import { CategoryManager } from "@/components/category-manager";
import type { Category } from "@/lib/types";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Manage the ingredient categories you want to flag when scanning labels.
      </p>
      <div className="mt-8">
        <CategoryManager
          initialCategories={(categories as Category[]) ?? []}
        />
      </div>
    </div>
  );
}
