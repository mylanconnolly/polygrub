"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/types";

export async function createIngredient(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const categoryId = formData.get("category_id") as string | null;
  const name = formData.get("name") as string | null;
  const description = formData.get("description") as string | null;

  if (!categoryId) return { error: "Category ID is required." };
  if (!name?.trim()) return { error: "Name is required." };
  if (!description?.trim()) return { error: "Description is required." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated." };

  const { error } = await supabase.from("ingredients").insert({
    user_id: user.id,
    category_id: categoryId,
    name: name.trim(),
    description: description.trim(),
  });

  if (error) return { error: error.message };

  revalidatePath(`/settings/categories/${categoryId}`);
  return { success: "Ingredient created." };
}

export async function updateIngredient(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const id = formData.get("id") as string | null;
  const categoryId = formData.get("category_id") as string | null;
  const name = formData.get("name") as string | null;
  const description = formData.get("description") as string | null;

  if (!id) return { error: "Ingredient ID is required." };
  if (!categoryId) return { error: "Category ID is required." };
  if (!name?.trim()) return { error: "Name is required." };
  if (!description?.trim()) return { error: "Description is required." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated." };

  const { error } = await supabase
    .from("ingredients")
    .update({
      name: name.trim(),
      description: description.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath(`/settings/categories/${categoryId}`);
  return { success: "Ingredient updated." };
}

export async function deleteIngredient(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const id = formData.get("id") as string | null;
  const categoryId = formData.get("category_id") as string | null;

  if (!id) return { error: "Ingredient ID is required." };
  if (!categoryId) return { error: "Category ID is required." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated." };

  const { error } = await supabase
    .from("ingredients")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath(`/settings/categories/${categoryId}`);
  return { success: "Ingredient deleted." };
}
