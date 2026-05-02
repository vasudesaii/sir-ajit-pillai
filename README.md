# Sir Ajit Pillai Classes - Database Setup

## What changed

The app now connects to **Supabase** as its primary database, with `localStorage` as a transparent fallback.

- All CRUD operations sync to Supabase automatically.
- **Realtime updates** — when Sir adds homework on one device, students see it instantly on theirs.
- If Supabase is not configured, the app runs entirely from `localStorage` just like before.

---

## 1. Create a Supabase project

1. Go to [https://supabase.com](https://supabase.com) and sign up / log in.
2. Click **"New Project"**.
3. Choose a name (e.g. `ajit-pillai-classes`), set a secure database password, and choose a region close to you (e.g. `Mumbai` or `Singapore`).
4. Wait ~2 minutes for the project to spin up.

---

## 2. Run the database schema

1. In your Supabase project, open the **SQL Editor** (left sidebar).
2. Click **"New query"**.
3. Copy the entire contents of `database/schema.sql` from this project and paste it in.
4. Click **Run**.

This creates all 9 tables with proper foreign keys and realtime enabled.

---

## 3. Get your API credentials

1. In Supabase, go to **Project Settings → API**.
2. Copy:
   - `URL` (looks like `https://abcdefgh12345678.supabase.co`)
   - `anon / public` key (starts with `eyJ...`)

---

## 4. Connect the app

Open the `.env` file in this project and paste your credentials:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJyour-anon-key-here
```

**Do not commit `.env` to Git.** It is already listed in `.gitignore` by default in Vite projects.

---

## 5. Install dependencies & run

```bash
npm install
npm run dev
```

The app will open at `http://localhost:5173`.

---

## How the sync works

- On first load, the app fetches all data from Supabase.
- Every time you add / edit / delete a classroom, student, homework, etc., the change is **automatically synced** to Supabase.
- `localStorage` is kept as a **backup cache** so the app still works offline.
- If you open the app on two devices, changes appear on both within seconds thanks to **Supabase Realtime**.

---

## Seeding initial data (optional)

If you want to start with the demo students, parents, and homework already in the database:

1. Log in as **Admin** (`ajitpillai007` / `AjitSir@2026`).
2. The app will load from `localStorage` (which has the `SEED` data).
3. Make any small change (e.g., create a test classroom then delete it). This triggers a full sync, pushing all existing seed data into Supabase.
4. From then on, all data lives in Supabase and syncs across devices.

Alternatively, you can write a small SQL `INSERT` script using the demo data from `SEED` in `src/App.jsx`.

---

## Production deployment

Build the app with:

```bash
npm run build
```

Deploy the `dist/` folder to **Vercel**, **Netlify**, or **GitHub Pages**.
Remember to add the same `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` environment variables in your hosting platform.
