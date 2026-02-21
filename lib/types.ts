export const CATEGORY_COLORS = [
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
  "pink",
  "rose",
  "slate",
  "gray",
  "zinc",
  "neutral",
  "stone",
] as const;

export type CategoryColor = (typeof CATEGORY_COLORS)[number];

export type Category = {
  id: string;
  user_id: string;
  name: string;
  description: string;
  color: CategoryColor;
  created_at: string;
  updated_at: string;
};

export type Ingredient = {
  id: string;
  category_id: string;
  user_id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
};

export type PhotoStatus = "pending" | "processing" | "complete" | "error";

export type Photo = {
  id: string;
  user_id: string;
  filename: string;
  status: PhotoStatus;
  created_at: string;
  updated_at: string;
};

export type PhotoIngredient = {
  confidence: number;
  description: string | null;
  ingredient: {
    id: string;
    name: string;
    category: {
      id: string;
      name: string;
      color: CategoryColor;
    };
  };
};

export type ActionResult = {
  error?: string;
  success?: string;
} | null;
