"use client";

import { useRef, useState, useCallback } from "react";
import {
  ArrowUpTrayIcon,
  CameraIcon,
  PhotoIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { createClient } from "@/lib/supabase/client";
import { createPhoto } from "@/lib/actions/photos";
import { resizeImage } from "@/lib/resize-image";

type UploadEntry = {
  id: string;
  name: string;
  status: "resizing" | "uploading" | "done" | "error";
  preview?: string;
  error?: string;
};

export function PhotoUploader({ userId }: { userId: string }) {
  const [uploads, setUploads] = useState<UploadEntry[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const cameraRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const updateUpload = useCallback(
    (id: string, patch: Partial<UploadEntry>) => {
      setUploads((prev) =>
        prev.map((u) => (u.id === id ? { ...u, ...patch } : u)),
      );
    },
    [],
  );

  const processFile = useCallback(
    async (file: File) => {
      const id = crypto.randomUUID();
      const preview = URL.createObjectURL(file);

      setUploads((prev) => [
        { id, name: file.name, status: "resizing", preview },
        ...prev,
      ]);

      try {
        const resized = await resizeImage(file);

        updateUpload(id, { status: "uploading" });

        const supabase = createClient();
        const { error: uploadError } = await supabase.storage
          .from("photos")
          .upload(`${userId}/${id}`, resized, {
            contentType: "image/jpeg",
          });

        if (uploadError) throw uploadError;

        const formData = new FormData();
        formData.set("id", id);
        formData.set("filename", file.name);
        const result = await createPhoto(null, formData);

        if (result?.error) throw new Error(result.error);

        updateUpload(id, { status: "done" });
      } catch (err) {
        updateUpload(id, {
          status: "error",
          error: err instanceof Error ? err.message : "Upload failed",
        });
      }
    },
    [userId, updateUpload],
  );

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      Array.from(files).forEach(processFile);
    },
    [processFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  return (
    <div className="space-y-6">
      <div
        role="region"
        aria-label="Photo upload area"
        onDragEnter={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragOver(false);
        }}
        onDrop={handleDrop}
        className={`rounded-lg border-2 border-dashed p-8 text-center transition ${
          dragOver
            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20"
            : "border-zinc-300 dark:border-zinc-700"
        }`}
      >
        <ArrowUpTrayIcon className="mx-auto h-10 w-10 text-zinc-400" aria-hidden="true" />
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
          Drag and drop photos here, or use the buttons below
        </p>

        <div className="mt-4 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => cameraRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
          >
            <CameraIcon className="h-5 w-5" aria-hidden="true" />
            Camera
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-md bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-700 dark:hover:bg-zinc-600"
          >
            <PhotoIcon className="h-5 w-5" aria-hidden="true" />
            Choose Files
          </button>
        </div>

        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {uploads.length > 0 && (
        <ul aria-live="polite" className="space-y-3">
          {uploads.map((upload) => (
            <li
              key={upload.id}
              className="flex items-center gap-3 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
            >
              {upload.preview && (
                <img
                  src={upload.preview}
                  alt=""
                  className="h-12 w-12 rounded object-cover"
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{upload.name}</p>
                <p className="text-xs text-zinc-500">
                  {upload.status === "resizing" && "Resizing..."}
                  {upload.status === "uploading" && "Uploading..."}
                  {upload.status === "done" && "Uploaded"}
                  {upload.status === "error" && (upload.error ?? "Error")}
                </p>
              </div>
              {upload.status === "done" && (
                <CheckCircleIcon className="h-5 w-5 shrink-0 text-emerald-500" aria-hidden="true" />
              )}
              {upload.status === "error" && (
                <ExclamationCircleIcon className="h-5 w-5 shrink-0 text-red-500" aria-hidden="true" />
              )}
              {(upload.status === "resizing" ||
                upload.status === "uploading") && (
                <div
                  role="status"
                  aria-label="Uploading"
                  className="h-5 w-5 shrink-0 animate-spin motion-reduce:animate-none rounded-full border-2 border-zinc-300 border-t-emerald-500"
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
