import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { createClient } from "@/lib/supabase/server";
import { PhotoDetail } from "@/components/photo-detail";
import type { Photo } from "@/lib/types";

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

  const { data: signedUrlData } = await supabase.storage
    .from("photos")
    .createSignedUrl(`${user.id}/${p.id}`, 3600);

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
        <PhotoDetail photo={p} imageUrl={imageUrl} />
      </div>
    </div>
  );
}
