"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/types";

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
  return { success: "Photo uploaded." };
}
