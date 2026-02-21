import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PhotoGrid } from "@/components/photo-grid";
import type { Photo } from "@/lib/types";

export default async function PhotosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const { data: photos } = await supabase
    .from("photos")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const photoList = (photos as Photo[]) ?? [];

  const photosWithUrls = await Promise.all(
    photoList.map(async (photo) => {
      const { data } = await supabase.storage
        .from("photos")
        .createSignedUrl(`${user.id}/${photo.id}`, 3600);

      return {
        id: photo.id,
        filename: photo.filename,
        status: photo.status,
        created_at: photo.created_at,
        imageUrl: data?.signedUrl ?? "",
      };
    }),
  );

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Photos</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        View your uploaded ingredient label photos and their processing status.
      </p>
      <div className="mt-8">
        <PhotoGrid photos={photosWithUrls} />
      </div>
    </div>
  );
}
