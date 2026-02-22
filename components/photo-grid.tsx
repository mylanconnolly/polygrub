"use client";

import Link from "next/link";
import Image from "next/image";
import { PhotoIcon } from "@heroicons/react/24/outline";
import { useRealtimeRefresh } from "@/hooks/use-realtime-refresh";
import type { PhotoStatus } from "@/lib/types";

type PhotoItem = {
  id: string;
  filename: string;
  status: PhotoStatus;
  created_at: string;
  imageUrl: string;
};

const statusConfig: Record<
  PhotoStatus,
  { label: string; dot: string; bg: string; text: string }
> = {
  pending: {
    label: "Pending",
    dot: "bg-zinc-400",
    bg: "bg-zinc-100 dark:bg-zinc-800",
    text: "text-zinc-600 dark:text-zinc-400",
  },
  processing: {
    label: "Processing",
    dot: "bg-amber-400",
    bg: "bg-amber-50 dark:bg-amber-900/20",
    text: "text-amber-700 dark:text-amber-400",
  },
  complete: {
    label: "Complete",
    dot: "bg-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    text: "text-emerald-700 dark:text-emerald-400",
  },
  error: {
    label: "Error",
    dot: "bg-red-400",
    bg: "bg-red-50 dark:bg-red-900/20",
    text: "text-red-700 dark:text-red-400",
  },
};

export function StatusBadge({ status }: { status: PhotoStatus }) {
  const config = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${config.bg} ${config.text}`}
    >
      <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

export function PhotoGrid({ photos, userId }: { photos: PhotoItem[]; userId: string }) {
  useRealtimeRefresh(`photos:${userId}`, [
    { table: "photos", filter: `user_id=eq.${userId}` },
  ]);

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 py-16 dark:border-zinc-700">
        <PhotoIcon className="h-10 w-10 text-zinc-400" aria-hidden="true" />
        <p className="mt-3 text-sm font-medium text-zinc-600 dark:text-zinc-400">
          No photos yet
        </p>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-500">
          Upload a photo on the Scan page to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {photos.map((photo) => (
        <Link
          key={photo.id}
          href={`/photos/${photo.id}`}
          className="group overflow-hidden rounded-lg border border-zinc-200 transition hover:border-zinc-300 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:border-zinc-800 dark:hover:border-zinc-700 dark:focus-visible:ring-offset-black"
        >
          <div className="relative aspect-square bg-zinc-100 dark:bg-zinc-900">
            <Image
              src={photo.imageUrl}
              alt={`Ingredient label: ${photo.filename}`}
              fill
              className="object-cover transition group-hover:scale-105 motion-reduce:transform-none"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          </div>
          <div className="px-3 py-2">
            <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {photo.filename}
            </p>
            <div className="mt-1">
              <StatusBadge status={photo.status} />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
