import Link from "next/link";
import {
  CameraIcon,
  ShieldExclamationIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/navbar";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
      {user && <Navbar email={user.email!} />}

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-20">
        <div className="flex max-w-3xl flex-col items-center gap-6 text-center">
          <span className="rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-medium text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
            Know what&apos;s in your food
          </span>

          <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">
            Scan. Spot.{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-300">
              Stay safe.
            </span>
          </h1>

          <p className="max-w-xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Snap a photo of any ingredient label and instantly flag allergens,
            dietary restrictions, and anything else you need to watch for.
          </p>

          {user ? (
            <Link
              href="/scan"
              className="rounded-full bg-emerald-600 px-8 py-3 text-sm font-medium text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400"
            >
              Start scanning
            </Link>
          ) : (
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/sign-up"
                className="rounded-full bg-emerald-600 px-8 py-3 text-sm font-medium text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400"
              >
                Get started free
              </Link>
              <Link
                href="/sign-in"
                className="rounded-full border border-zinc-300 px-6 py-3 text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
              >
                Sign in
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* Features */}
      <section className="border-t border-zinc-200 bg-white px-4 py-20 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto grid max-w-4xl gap-10 sm:grid-cols-3">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/30">
              <CameraIcon className="h-6 w-6 text-emerald-700 dark:text-emerald-400" />
            </div>
            <h3 className="font-semibold">Snap a Label</h3>
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Take a photo of any ingredient list and let PolyGrub read it for
              you — no squinting required.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-900/30">
              <ShieldExclamationIcon className="h-6 w-6 text-amber-700 dark:text-amber-400" />
            </div>
            <h3 className="font-semibold">Flag What Matters</h3>
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Set up your dietary profile — allergens, vegan, gluten-free, or
              any custom category — and get instant alerts.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 dark:bg-sky-900/30">
              <ClipboardDocumentListIcon className="h-6 w-6 text-sky-700 dark:text-sky-400" />
            </div>
            <h3 className="font-semibold">Build Your History</h3>
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Every scan is saved so you can revisit products, track patterns,
              and share results with others.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
          <div className="mt-12 grid gap-8 text-left sm:grid-cols-3">
            <div>
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                1
              </div>
              <h3 className="mt-2 font-semibold">Set your profile</h3>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Choose ingredient categories you want to watch — dairy, nuts,
                shellfish, soy, and more.
              </p>
            </div>
            <div>
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                2
              </div>
              <h3 className="mt-2 font-semibold">Scan a label</h3>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Upload or photograph an ingredient label. PolyGrub extracts and
                analyzes every ingredient.
              </p>
            </div>
            <div>
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                3
              </div>
              <h3 className="mt-2 font-semibold">Get your results</h3>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                See flagged ingredients highlighted instantly — safe or not, at a
                glance.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
