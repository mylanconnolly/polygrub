import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { createClient } from "@/lib/supabase/server";
import { IngredientManager } from "@/components/ingredient-manager";
import { ColorDot } from "@/components/color-dot";
import type { Category, Ingredient } from "@/lib/types";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) notFound();

  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!category) notFound();

  const { data: ingredients } = await supabase
    .from("ingredients")
    .select("*")
    .eq("category_id", id)
    .eq("user_id", user.id)
    .order("name");

  const cat = category as Category;

  return (
    <div>
      <Link
        href="/settings"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back to settings
      </Link>

      <div className="mt-4 flex items-center gap-3">
        <ColorDot color={cat.color} />
        <h1 className="text-2xl font-bold tracking-tight">{cat.name}</h1>
      </div>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        {cat.description}
      </p>

      <div className="mt-8">
        <IngredientManager
          categoryId={cat.id}
          initialIngredients={(ingredients as Ingredient[]) ?? []}
        />
      </div>
    </div>
  );
}
