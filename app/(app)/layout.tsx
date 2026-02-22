import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/navbar";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Navbar email={user.email!} />
      <main id="main-content" className="mx-auto max-w-5xl px-4 py-8">
        {children}
      </main>
    </div>
  );
}
