import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-black">
      <main className="flex max-w-2xl flex-col items-center gap-8 text-center">
        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
          PolyGrub
        </h1>
        <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          Share photos of your favorite meals, discover new restaurants, and
          connect with fellow food lovers. Your visual food journal starts here.
        </p>

        {user ? (
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Welcome, {user.email}
            </p>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-md border border-zinc-300 px-6 py-3 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
              >
                Sign out
              </button>
            </form>
          </div>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/sign-up"
              className="rounded-md bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Get started
            </Link>
            <Link
              href="/sign-in"
              className="rounded-md border border-zinc-300 px-6 py-3 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
            >
              Sign in
            </Link>
          </div>
        )}

        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          <div className="rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
            <h3 className="font-semibold">Snap &amp; Share</h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Capture your meals and share them with the community in seconds.
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
            <h3 className="font-semibold">Discover</h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Find new dishes and restaurants through photos from people you
              follow.
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
            <h3 className="font-semibold">Food Journal</h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Keep a visual record of every great meal you&apos;ve ever had.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
