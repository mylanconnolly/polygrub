# PolyGrub

Scan ingredient labels to identify allergens and dietary restrictions. Upload a photo of an ingredient list and PolyGrub uses AI to flag noteworthy ingredients — dairy, meat, common allergens, or anything else you configure — with confidence scores and category grouping.

## Tech stack

| Layer        | Technology                                      |
| ------------ | ----------------------------------------------- |
| Framework    | Next.js 16 (App Router)                         |
| Language     | TypeScript 5 (strict mode)                      |
| UI           | React 19, Tailwind CSS 4, Heroicons 2           |
| Auth         | Supabase Auth (email/password)                  |
| Database     | Supabase Postgres                               |
| Storage      | Supabase Storage                                |
| Realtime     | Supabase Postgres Changes (websocket)           |
| AI analysis  | Supabase Edge Function (triggered by DB insert) |
| Font         | Geist Sans / Geist Mono via `next/font`         |

## Features

- **Photo scanning** — upload or capture an ingredient label photo; images are resized client-side before upload
- **AI ingredient analysis** — a Supabase Edge Function analyzes photos and returns flagged ingredients with confidence percentages
- **Custom categories** — create ingredient categories (e.g. "Dairy", "Allergens") with color coding
- **Custom ingredients** — define the specific ingredients you want to watch for within each category
- **Real-time updates** — photo analysis status and results stream in live via Supabase Realtime
- **Re-analyze** — trigger a new analysis run on any previously uploaded photo
- **Responsive design** — mobile-first layout with collapsible navigation
- **Dark mode** — full dark mode support via Tailwind

## Project structure

```
app/
  (public)/                    # Unauthenticated routes
    page.tsx                   #   Landing page
    sign-in/page.tsx           #   Sign-in form
    sign-up/page.tsx           #   Sign-up form
  (app)/                       # Authenticated routes (protected by layout)
    layout.tsx                 #   Navbar + auth guard
    scan/page.tsx              #   Photo upload
    photos/page.tsx            #   Photo gallery
    photos/[id]/page.tsx       #   Photo detail + ingredient results
    settings/page.tsx          #   Category management
    settings/categories/[id]/  #   Ingredient management per category
  auth/
    confirm/route.ts           #   Email confirmation callback
    error/page.tsx             #   Auth error display

components/
  navbar.tsx                   # Top nav with mobile hamburger menu
  photo-uploader.tsx           # Drag-drop / camera capture upload
  photo-grid.tsx               # Gallery grid with status badges
  photo-detail.tsx             # Photo viewer + grouped ingredient list
  category-manager.tsx         # Category CRUD with color picker
  ingredient-manager.tsx       # Ingredient CRUD within a category
  color-dot.tsx                # Colored circle indicator
  dialog.tsx                   # Modal wrapper using native <dialog>

lib/
  types.ts                     # Shared TypeScript types
  utils.ts                     # Utility functions
  resize-image.ts              # Client-side image resize (max 1000px)
  actions/
    auth.ts                    # signIn, signUp, signOut
    photos.ts                  # createPhoto, deletePhoto, reanalyzePhoto
    categories.ts              # createCategory, updateCategory, deleteCategory
    ingredients.ts             # createIngredient, updateIngredient, deleteIngredient
  supabase/
    client.ts                  # Browser Supabase client
    server.ts                  # Server-side Supabase client
    proxy.ts                   # Middleware session management

hooks/
  use-realtime-refresh.ts      # Supabase Realtime → router.refresh()

middleware.ts                  # Auth session refresh on every request
```

## Architecture

### Route map

| Path                           | Auth     | Description                         |
| ------------------------------ | -------- | ----------------------------------- |
| `/`                            | Public   | Landing page                        |
| `/sign-in`                     | Public   | Email/password sign-in              |
| `/sign-up`                     | Public   | Registration                        |
| `/auth/confirm`                | Public   | Email confirmation handler          |
| `/auth/error`                  | Public   | Auth error display                  |
| `/scan`                        | Required | Upload an ingredient label photo    |
| `/photos`                      | Required | Gallery of uploaded photos          |
| `/photos/[id]`                 | Required | Photo detail with analysis results  |
| `/settings`                    | Required | Manage ingredient categories        |
| `/settings/categories/[id]`   | Required | Manage ingredients in a category    |

### Server actions

All data mutations go through React server actions in `lib/actions/`. Each action:

1. Accepts `FormData` from the client
2. Creates a server-side Supabase client (inheriting the user session)
3. Performs the database operation
4. Calls `revalidatePath()` to bust the ISR cache
5. Returns `{ error?, success? }` to the client

Client components consume these via React's `useActionState` hook for pending states and feedback messages.

### Photo analysis pipeline

```
User uploads photo
  → Client resizes image (max 1000px, 85% JPEG quality)
  → Client uploads to Supabase Storage (photos/{user_id}/{photo_id})
  → Server action inserts row into `photos` table (status: "pending")
  → DB trigger fires on insert → creates row in `analysis_jobs`
  → Supabase Edge Function picks up the job, analyzes the image
  → Edge Function writes results to `photo_ingredients`, updates photo status
  → Realtime subscription pushes changes to the client
```

### Real-time subscriptions

The `useRealtimeRefresh` hook subscribes to Supabase Postgres Changes events on specific tables. When a row is inserted, updated, or deleted, it calls `router.refresh()` (debounced at 300ms) to re-fetch server component data. Used on the photo gallery, photo detail, category manager, and ingredient manager pages.

## Database schema

### Tables

**photos**
| Column        | Type      | Description                          |
| ------------- | --------- | ------------------------------------ |
| id            | uuid      | Primary key                          |
| user_id       | uuid      | Owner (references auth.users)        |
| filename      | text      | Original filename                    |
| status        | enum      | pending / processing / complete / error |
| created_at    | timestamptz | Upload time                          |
| updated_at    | timestamptz | Last modified                        |
| pending_at    | timestamptz | When status set to pending           |
| processing_at | timestamptz | When analysis started                |
| complete_at   | timestamptz | When analysis completed              |
| error_at      | timestamptz | When analysis errored                |

**photo_ingredients**
| Column        | Type      | Description                          |
| ------------- | --------- | ------------------------------------ |
| photo_id      | uuid      | References photos.id                 |
| user_id       | uuid      | Owner                                |
| ingredient_id | uuid      | References ingredients.id            |
| confidence    | numeric   | AI confidence score (0-1)            |
| description   | text      | Context from the AI about the match  |

**categories**
| Column      | Type      | Description                            |
| ----------- | --------- | -------------------------------------- |
| id          | uuid      | Primary key                            |
| user_id     | uuid      | Owner                                  |
| name        | text      | Category name (e.g. "Dairy")           |
| description | text      | Optional description                   |
| color       | text      | Tailwind color name (e.g. "red")       |
| created_at  | timestamp | Created time                           |
| updated_at  | timestamp | Last modified                          |

**ingredients**
| Column      | Type      | Description                            |
| ----------- | --------- | -------------------------------------- |
| id          | uuid      | Primary key                            |
| category_id | uuid      | References categories.id               |
| user_id     | uuid      | Owner                                  |
| name        | text      | Ingredient name (e.g. "Whey protein")  |
| description | text      | Optional description                   |
| created_at  | timestamp | Created time                           |
| updated_at  | timestamp | Last modified                          |

**analysis_jobs**
| Column   | Type | Description                                  |
| -------- | ---- | -------------------------------------------- |
| photo_id | uuid | References photos.id                         |
| status   | text | Job status (triggers Edge Function on insert)|

### Trigger chain

A database trigger watches for inserts on the `photos` table. When a new photo is created, the trigger inserts a row into `analysis_jobs` with status `"pending"`. This fires the Supabase Edge Function that performs the AI analysis, writes results back to `photo_ingredients`, and updates the photo's status to `"complete"` (or `"error"`).

## Getting started

### Prerequisites

- Node.js 18+
- npm (or pnpm / yarn / bun)
- A [Supabase](https://supabase.com) project with:
  - Auth enabled (email/password provider)
  - Storage bucket named `photos`
  - The database tables and triggers described above
  - An Edge Function for ingredient analysis

### Setup

```bash
# Clone the repository
git clone <repo-url>
cd photogrub

# Install dependencies
npm install

# Configure environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase project URL and publishable key
```

The `.env.local.example` file contains:

```
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-publishable-key>
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Command         | Description                |
| --------------- | -------------------------- |
| `npm run dev`   | Start development server   |
| `npm run build` | Production build           |
| `npm run start` | Start production server    |
| `npm run lint`  | Run ESLint                 |
