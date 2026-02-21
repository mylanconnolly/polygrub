"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { createCategory, updateCategory, deleteCategory } from "@/lib/actions/categories";
import { ColorDot } from "@/components/color-dot";
import { Dialog } from "@/components/dialog";
import { useRealtimeRefresh } from "@/hooks/use-realtime-refresh";
import {
  CATEGORY_COLORS,
  type ActionResult,
  type Category,
  type CategoryColor,
} from "@/lib/types";

const colorLabels: Record<CategoryColor, string> = {
  red: "Red",
  orange: "Orange",
  amber: "Amber",
  yellow: "Yellow",
  lime: "Lime",
  green: "Green",
  emerald: "Emerald",
  teal: "Teal",
  cyan: "Cyan",
  sky: "Sky",
  blue: "Blue",
  indigo: "Indigo",
  violet: "Violet",
  purple: "Purple",
  fuchsia: "Fuchsia",
  pink: "Pink",
  rose: "Rose",
  slate: "Slate",
  gray: "Gray",
  zinc: "Zinc",
  neutral: "Neutral",
  stone: "Stone",
};

type ModalState =
  | null
  | { mode: "create" }
  | { mode: "edit"; category: Category }
  | { mode: "delete"; category: Category };

function CategoryForm({
  category,
  action,
  onClose,
}: {
  category?: Category;
  action: (prevState: ActionResult, formData: FormData) => Promise<ActionResult>;
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const [selectedColor, setSelectedColor] = useState<CategoryColor>(
    category?.color ?? "zinc",
  );

  useEffect(() => {
    if (state?.success) onClose();
  }, [state?.success, onClose]);

  return (
    <form action={formAction} className="space-y-4">
      {category && <input type="hidden" name="id" value={category.id} />}

      {state?.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}

      <div>
        <label htmlFor="cat-name" className="block text-sm font-medium">
          Name
        </label>
        <input
          id="cat-name"
          name="name"
          type="text"
          required
          autoFocus
          defaultValue={category?.name}
          className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      <div>
        <label htmlFor="cat-desc" className="block text-sm font-medium">
          Description
        </label>
        <input
          id="cat-desc"
          name="description"
          type="text"
          required
          defaultValue={category?.description}
          className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      <div>
        <span className="block text-sm font-medium">Color</span>
        <input type="hidden" name="color" value={selectedColor} />
        <div className="mt-2 flex flex-wrap gap-2">
          {CATEGORY_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              title={colorLabels[c]}
              onClick={() => setSelectedColor(c)}
              className={`h-7 w-7 rounded-full transition ${
                selectedColor === c
                  ? "ring-2 ring-zinc-900 ring-offset-2 dark:ring-zinc-100 dark:ring-offset-zinc-950"
                  : "hover:ring-2 hover:ring-zinc-400 hover:ring-offset-2 dark:hover:ring-zinc-600 dark:hover:ring-offset-zinc-950"
              }`}
            >
              <ColorDot color={c} />
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:opacity-50 dark:bg-emerald-500 dark:hover:bg-emerald-400"
        >
          <CheckIcon className="h-4 w-4" />
          {pending ? "Saving..." : category ? "Update" : "Create"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-1.5 rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          <XMarkIcon className="h-4 w-4" />
          Cancel
        </button>
      </div>
    </form>
  );
}

function DeleteConfirmation({
  category,
  onClose,
}: {
  category: Category;
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState(deleteCategory, null);

  useEffect(() => {
    if (state?.success) onClose();
  }, [state?.success, onClose]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={category.id} />

      {state?.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}

      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Are you sure you want to delete{" "}
        <span className="font-medium text-zinc-900 dark:text-zinc-100">
          {category.name}
        </span>
        ? This action cannot be undone.
      </p>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={pending}
          autoFocus
          className="flex items-center gap-1.5 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500 disabled:opacity-50"
        >
          <TrashIcon className="h-4 w-4" />
          {pending ? "Deleting..." : "Delete"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-1.5 rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export function CategoryManager({
  initialCategories,
  ingredientCounts,
  userId,
}: {
  initialCategories: Category[];
  ingredientCounts: Record<string, number>;
  userId: string;
}) {
  useRealtimeRefresh(`categories:${userId}`, [
    { table: "categories", filter: `user_id=eq.${userId}` },
    { table: "ingredients", filter: `user_id=eq.${userId}` },
  ]);

  const [modalState, setModalState] = useState<ModalState>(null);
  const closeModal = () => setModalState(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Categories</h2>
        <button
          type="button"
          onClick={() => setModalState({ mode: "create" })}
          className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400"
        >
          <PlusIcon className="h-4 w-4" />
          Add category
        </button>
      </div>

      {initialCategories.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No categories yet. Add one to start flagging ingredients.
        </p>
      ) : (
        <div className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
          {initialCategories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between px-4 py-3"
            >
              <Link
                href={`/settings/categories/${cat.id}`}
                className="flex items-center gap-3 transition hover:opacity-75"
              >
                <ColorDot color={cat.color} />
                <div>
                  <p className="text-sm font-medium">{cat.name}</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {cat.description}
                    {" · "}
                    {ingredientCounts[cat.id] ?? 0}{" "}
                    {ingredientCounts[cat.id] === 1
                      ? "ingredient"
                      : "ingredients"}
                  </p>
                </div>
              </Link>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setModalState({ mode: "edit", category: cat })}
                  className="rounded-md p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-900 dark:hover:text-zinc-200"
                  title="Edit"
                >
                  <PencilSquareIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setModalState({ mode: "delete", category: cat })}
                  className="rounded-md p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-red-600 dark:hover:bg-zinc-900 dark:hover:text-red-400"
                  title="Delete"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={modalState?.mode === "create"}
        onClose={closeModal}
        title="Add category"
      >
        {modalState?.mode === "create" && (
          <CategoryForm action={createCategory} onClose={closeModal} />
        )}
      </Dialog>

      <Dialog
        open={modalState?.mode === "edit"}
        onClose={closeModal}
        title="Edit category"
      >
        {modalState?.mode === "edit" && (
          <CategoryForm
            category={modalState.category}
            action={updateCategory}
            onClose={closeModal}
          />
        )}
      </Dialog>

      <Dialog
        open={modalState?.mode === "delete"}
        onClose={closeModal}
        title="Delete category"
      >
        {modalState?.mode === "delete" && (
          <DeleteConfirmation
            category={modalState.category}
            onClose={closeModal}
          />
        )}
      </Dialog>
    </div>
  );
}
