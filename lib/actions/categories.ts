"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { CATEGORY_COLORS, type ActionResult, type CategoryColor } from "@/lib/types";

export async function createCategory(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const name = formData.get("name") as string | null;
  const description = formData.get("description") as string | null;
  const color = formData.get("color") as string | null;

  if (!name?.trim()) return { error: "Name is required." };
  if (!description?.trim()) return { error: "Description is required." };
  if (!color || !CATEGORY_COLORS.includes(color as CategoryColor)) {
    return { error: "Please select a valid color." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated." };

  const { error } = await supabase.from("categories").insert({
    user_id: user.id,
    name: name.trim(),
    description: description.trim(),
    color,
  });

  if (error) return { error: error.message };

  revalidatePath("/settings");
  return { success: "Category created." };
}

export async function updateCategory(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const id = formData.get("id") as string | null;
  const name = formData.get("name") as string | null;
  const description = formData.get("description") as string | null;
  const color = formData.get("color") as string | null;

  if (!id) return { error: "Category ID is required." };
  if (!name?.trim()) return { error: "Name is required." };
  if (!description?.trim()) return { error: "Description is required." };
  if (!color || !CATEGORY_COLORS.includes(color as CategoryColor)) {
    return { error: "Please select a valid color." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated." };

  const { error } = await supabase
    .from("categories")
    .update({
      name: name.trim(),
      description: description.trim(),
      color,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/settings");
  return { success: "Category updated." };
}

export async function deleteCategory(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const id = formData.get("id") as string | null;

  if (!id) return { error: "Category ID is required." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated." };

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/settings");
  return { success: "Category deleted." };
}
