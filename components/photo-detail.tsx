"use client";

import { useState, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { TrashIcon } from "@heroicons/react/24/outline";
import { Dialog } from "@/components/dialog";
import { StatusBadge } from "@/components/photo-grid";
import { deletePhoto } from "@/lib/actions/photos";
import type { Photo } from "@/lib/types";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString();
}

export function PhotoDetail({
  photo,
  imageUrl,
}: {
  photo: Photo;
  imageUrl: string;
}) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [state, action, pending] = useActionState(deletePhoto, null);

  useEffect(() => {
    if (state?.success) {
      router.push("/photos");
    }
  }, [state, router]);

  return (
    <div>
      <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
        <div className="relative aspect-video bg-zinc-100 dark:bg-zinc-900">
          <Image
            src={imageUrl}
            alt={photo.filename}
            fill
            className="object-contain"
            sizes="(max-width: 1024px) 100vw, 960px"
            priority
          />
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {photo.filename}
            </h2>
            <div className="mt-1">
              <StatusBadge status={photo.status} />
            </div>
          </div>
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            <TrashIcon className="h-4 w-4" />
            Delete
          </button>
        </div>

        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-zinc-500 dark:text-zinc-400">Created</dt>
            <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100">
              {formatDate(photo.created_at)}
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500 dark:text-zinc-400">Updated</dt>
            <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100">
              {formatDate(photo.updated_at)}
            </dd>
          </div>
        </dl>
      </div>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Delete photo"
      >
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Are you sure you want to delete{" "}
          <span className="font-medium text-zinc-900 dark:text-zinc-100">
            {photo.filename}
          </span>
          ? This action cannot be undone.
        </p>
        {state?.error && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {state.error}
          </p>
        )}
        <div className="mt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setConfirmOpen(false)}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
          >
            Cancel
          </button>
          <form action={action}>
            <input type="hidden" name="id" value={photo.id} />
            <button
              type="submit"
              disabled={pending}
              className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
            >
              {pending ? "Deleting..." : "Delete"}
            </button>
          </form>
        </div>
      </Dialog>
    </div>
  );
}
