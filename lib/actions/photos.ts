"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult, Photo } from "@/lib/types";

export async function createPhoto(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const id = formData.get("id") as string | null;
  const filename = formData.get("filename") as string | null;

  if (!id) return { error: "Photo ID is required." };
  if (!filename?.trim()) return { error: "Filename is required." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated." };

  const { error } = await supabase.from("photos").insert({
    id,
    user_id: user.id,
    filename: filename.trim(),
  });

  if (error) return { error: error.message };

  revalidatePath("/scan");
  revalidatePath("/photos");
  return { success: "Photo uploaded." };
}

export async function deletePhoto(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const id = formData.get("id") as string | null;

  if (!id) return { error: "Photo ID is required." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated." };

  const { data: photo } = await supabase
    .from("photos")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!photo) return { error: "Photo not found." };

  const p = photo as Photo;

  const { error: storageError } = await supabase.storage
    .from("photos")
    .remove([`${user.id}/${p.id}`]);

  if (storageError) return { error: storageError.message };

  const { error: dbError } = await supabase
    .from("photos")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (dbError) return { error: dbError.message };

  revalidatePath("/photos");
  return { success: "Photo deleted." };
}
