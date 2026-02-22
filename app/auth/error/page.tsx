import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Authentication Error" };

export default function AuthErrorPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Authentication Error</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Sorry, we couldn&apos;t verify your identity. Please try again.
        </p>
        <Link
          href="/sign-in"
          className="mt-4 inline-block text-sm font-medium text-zinc-900 hover:underline dark:text-zinc-100"
        >
          Back to sign in
        </Link>
      </div>
    </main>
  );
}
