import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { createClient } from "@/lib/supabase/server";
import { PhotoDetail } from "@/components/photo-detail";
import type { Photo, PhotoIngredient } from "@/lib/types";

export default async function PhotoPage({
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

  const { data: photo } = await supabase
    .from("photos")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!photo) notFound();

  const p = photo as Photo;

  const [{ data: signedUrlData }, { data: ingredients }] = await Promise.all([
    supabase.storage.from("photos").createSignedUrl(`${user.id}/${p.id}`, 3600),
    supabase
      .from("photo_ingredients")
      .select(
        "confidence, description, ingredient:ingredients(id, name, category:categories(id, name, color))",
      )
      .eq("photo_id", id)
      .eq("user_id", user.id),
  ]);

  const imageUrl = signedUrlData?.signedUrl ?? "";

  return (
    <div>
      <Link
        href="/photos"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back to photos
      </Link>

      <div className="mt-4">
        <PhotoDetail
          photo={p}
          imageUrl={imageUrl}
          ingredients={(ingredients as PhotoIngredient[]) ?? []}
          userId={user.id}
        />
      </div>
    </div>
  );
}
