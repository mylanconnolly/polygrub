"use client";

import { useActionState, useEffect, useState } from "react";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  createIngredient,
  updateIngredient,
  deleteIngredient,
} from "@/lib/actions/ingredients";
import { Dialog } from "@/components/dialog";
import { useRealtimeRefresh } from "@/hooks/use-realtime-refresh";
import type { ActionResult, Ingredient } from "@/lib/types";

type ModalState =
  | null
  | { mode: "create" }
  | { mode: "edit"; ingredient: Ingredient }
  | { mode: "delete"; ingredient: Ingredient };

function IngredientForm({
  categoryId,
  ingredient,
  action,
  onClose,
}: {
  categoryId: string;
  ingredient?: Ingredient;
  action: (prevState: ActionResult, formData: FormData) => Promise<ActionResult>;
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState(action, null);

  useEffect(() => {
    if (state?.success) onClose();
  }, [state?.success, onClose]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="category_id" value={categoryId} />
      {ingredient && <input type="hidden" name="id" value={ingredient.id} />}

      <div role="alert" aria-live="assertive">
        {state?.error && (
          <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
        )}
      </div>

      <div>
        <label htmlFor="ing-name" className="block text-sm font-medium">
          Name
        </label>
        <input
          id="ing-name"
          name="name"
          type="text"
          required
          autoFocus
          defaultValue={ingredient?.name}
          className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      <div>
        <label htmlFor="ing-desc" className="block text-sm font-medium">
          Description
        </label>
        <input
          id="ing-desc"
          name="description"
          type="text"
          required
          defaultValue={ingredient?.description}
          className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:opacity-50 dark:bg-emerald-500 dark:hover:bg-emerald-400"
        >
          <CheckIcon className="h-4 w-4" aria-hidden="true" />
          {pending ? "Saving..." : ingredient ? "Update" : "Create"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-1.5 rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          <XMarkIcon className="h-4 w-4" aria-hidden="true" />
          Cancel
        </button>
      </div>
    </form>
  );
}

function DeleteConfirmation({
  ingredient,
  categoryId,
  onClose,
}: {
  ingredient: Ingredient;
  categoryId: string;
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState(deleteIngredient, null);

  useEffect(() => {
    if (state?.success) onClose();
  }, [state?.success, onClose]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={ingredient.id} />
      <input type="hidden" name="category_id" value={categoryId} />

      <div role="alert" aria-live="assertive">
        {state?.error && (
          <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
        )}
      </div>

      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Are you sure you want to delete{" "}
        <span className="font-medium text-zinc-900 dark:text-zinc-100">
          {ingredient.name}
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
          <TrashIcon className="h-4 w-4" aria-hidden="true" />
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

export function IngredientManager({
  categoryId,
  userId,
  initialIngredients,
}: {
  categoryId: string;
  userId: string;
  initialIngredients: Ingredient[];
}) {
  useRealtimeRefresh(`ingredients:${categoryId}`, [
    { table: "ingredients", filter: `category_id=eq.${categoryId}` },
  ]);

  const [modalState, setModalState] = useState<ModalState>(null);
  const closeModal = () => setModalState(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Ingredients</h2>
        <button
          type="button"
          onClick={() => setModalState({ mode: "create" })}
          className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400"
        >
          <PlusIcon className="h-4 w-4" aria-hidden="true" />
          Add ingredient
        </button>
      </div>

      {initialIngredients.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No ingredients yet. Add one to start flagging it on labels.
        </p>
      ) : (
        <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
          {initialIngredients.map((ing) => (
            <li
              key={ing.id}
              className="flex items-center justify-between px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium">{ing.name}</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {ing.description}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() =>
                    setModalState({ mode: "edit", ingredient: ing })
                  }
                  className="rounded-md p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-900 dark:hover:text-zinc-200"
                  aria-label={`Edit ${ing.name}`}
                >
                  <PencilSquareIcon className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setModalState({ mode: "delete", ingredient: ing })
                  }
                  className="rounded-md p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-red-600 dark:hover:bg-zinc-900 dark:hover:text-red-400"
                  aria-label={`Delete ${ing.name}`}
                >
                  <TrashIcon className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog
        open={modalState?.mode === "create"}
        onClose={closeModal}
        title="Add ingredient"
      >
        {modalState?.mode === "create" && (
          <IngredientForm
            categoryId={categoryId}
            action={createIngredient}
            onClose={closeModal}
          />
        )}
      </Dialog>

      <Dialog
        open={modalState?.mode === "edit"}
        onClose={closeModal}
        title="Edit ingredient"
      >
        {modalState?.mode === "edit" && (
          <IngredientForm
            categoryId={categoryId}
            ingredient={modalState.ingredient}
            action={updateIngredient}
            onClose={closeModal}
          />
        )}
      </Dialog>

      <Dialog
        open={modalState?.mode === "delete"}
        onClose={closeModal}
        title="Delete ingredient"
      >
        {modalState?.mode === "delete" && (
          <DeleteConfirmation
            ingredient={modalState.ingredient}
            categoryId={categoryId}
            onClose={closeModal}
          />
        )}
      </Dialog>
    </div>
  );
}
