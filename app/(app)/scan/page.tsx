import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PhotoUploader } from "@/components/photo-uploader";

export default async function ScanPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Scan</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Upload ingredient label photos to scan for flagged ingredients.
      </p>
      <div className="mt-8">
        <PhotoUploader userId={user.id} />
      </div>
    </div>
  );
}
