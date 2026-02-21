"use client";

import { useState, useActionState } from "react";
import Image from "next/image";
import { TrashIcon } from "@heroicons/react/24/outline";
import { Dialog } from "@/components/dialog";
import { StatusBadge } from "@/components/photo-grid";
import { ColorDot } from "@/components/color-dot";
import { deletePhoto } from "@/lib/actions/photos";
import type { Photo, PhotoIngredient } from "@/lib/types";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString();
}

function groupByCategory(ingredients: PhotoIngredient[]) {
  const groups = new Map<
    string,
    { category: PhotoIngredient["ingredient"]["category"]; items: PhotoIngredient[] }
  >();
  for (const pi of ingredients) {
    const cat = pi.ingredient.category;
    const existing = groups.get(cat.id);
    if (existing) {
      existing.items.push(pi);
    } else {
      groups.set(cat.id, { category: cat, items: [pi] });
    }
  }
  return Array.from(groups.values());
}

function IngredientsSection({ ingredients }: { ingredients: PhotoIngredient[] }) {
  if (ingredients.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800/50">
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          No tracked ingredients found
        </p>
        <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
          None of the ingredients in this photo matched your tracked list.
        </p>
      </div>
    );
  }

  const groups = groupByCategory(ingredients);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        Identified Ingredients
      </h3>
      {groups.map(({ category, items }) => (
        <div key={category.id}>
          <div className="flex items-center gap-2">
            <ColorDot color={category.color} />
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {category.name}
            </span>
          </div>
          <ul className="mt-1.5 space-y-1 pl-5">
            {items.map((pi) => (
              <li key={pi.ingredient.id} className="text-sm">
                <span className="text-zinc-900 dark:text-zinc-100">
                  {pi.ingredient.name}
                </span>
                <span className="ml-2 text-zinc-500 dark:text-zinc-400">
                  {Math.round(pi.confidence * 100)}%
                </span>
                {pi.description && (
                  <span className="ml-2 text-zinc-500 dark:text-zinc-400">
                    — {pi.description}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function PhotoDetail({
  photo,
  imageUrl,
  ingredients,
}: {
  photo: Photo;
  imageUrl: string;
  ingredients: PhotoIngredient[];
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [state, action, pending] = useActionState(deletePhoto, null);

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

        {photo.status === "complete" && (
          <IngredientsSection ingredients={ingredients} />
        )}
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
