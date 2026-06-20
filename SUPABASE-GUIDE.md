# 🥃 Trixon — Supabase Setup (Shared Data for Everyone)

This is what makes Trixon work across every phone at once: guests scan the QR, request a
drink, and it appears in **your** queue live. Right now data is per-device; Supabase fixes
that by giving every device one shared brain in the cloud.

Follow these in order. Everything is free.

---

## Step 1 — Create a Supabase account & project

1. Go to **https://supabase.com** → **Start your project** → sign in with GitHub.
2. Click **New project**.
3. Fill in:
   - **Name:** `trixon`
   - **Database Password:** click **Generate a password** and let it save — you won't
     need to type it for this, but keep it somewhere just in case.
   - **Region:** pick the one closest to you.
4. Click **Create new project**. It takes ~2 minutes to spin up. Wait for the dashboard.

---

## Step 2 — Create the database table

1. In your Supabase project, click **SQL Editor** in the left sidebar (looks like `</>`).
2. Click **+ New query**.
3. Open the file **`supabase-setup.sql`** (in your trixon-app folder), copy ALL of it,
   and paste it into the editor.
4. Click **Run** (or press `⌘ + Enter`).
5. You should see **"Success. No rows returned"** — that's perfect. Your table is ready. ✅

---

## Step 3 — Grab your two keys

1. Click the **gear icon (Project Settings)** at the bottom left → **API**.
2. You'll see:
   - **Project URL** — looks like `https://abcdefgh.supabase.co`
   - **Project API keys** → the **`anon` `public`** key (a long string)
3. Keep this tab open — you'll copy these in the next step.

> These two values are safe to put in front-end code. The `anon` key is public by design;
> your data is protected by the rules we set in the SQL.

---

## Step 4 — Add the keys to your project (local)

1. In your `trixon-app` folder, find **`.env.example`**.
2. Make a copy of it named exactly **`.env.local`** (note the leading dot).
   - Easiest way: in Terminal, inside `trixon-app`, run:
     ```
     cp .env.example .env.local
     ```
3. Open **`.env.local`** in a text editor and paste your real values:
   ```
   VITE_SUPABASE_URL=https://YOUR-PROJECT-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-long-anon-key
   ```
4. Save the file.

---

## Step 5 — Install the Supabase library & test locally

In Terminal, inside `trixon-app`:

```
npm install
```

(That picks up the new Supabase package.) Then:

```
npm run dev
```

Open the `localhost` link. Trixon now reads and writes to Supabase! To prove it:
- Add a bottle on your Mac.
- Open the same `localhost` link on your **phone** (same Wi-Fi) — or just open a second
  browser window — and you'll see the same data. Changes sync live. 🎉

Stop the preview with `Control + C` when done.

---

## Step 6 — Add the keys to Vercel (so the LIVE site uses Supabase)

Your live site needs the keys too (they aren't pushed to GitHub, by design).

1. Go to your project on **vercel.com** → **Settings** → **Environment Variables**.
2. Add two variables (Name → Value):
   - `VITE_SUPABASE_URL` → your project URL
   - `VITE_SUPABASE_ANON_KEY` → your anon key
3. Make sure they apply to **Production** (and Preview/Development if offered — select all).
4. Click **Save**.

---

## Step 7 — Publish

In Terminal, inside `trixon-app`:

```
git add .
git commit -m "Add Supabase shared data"
git push
```

Vercel rebuilds automatically (~1 min). Now your **live URL** uses Supabase.

🎉 **Done.** Trixon is now a true shared bar: from any phone, on your real domain, a guest's
request lands in your queue in real time.

---

## Quick checks if something's off

- **Live site shows a blank screen** → the keys probably aren't set in Vercel (Step 6), or
  you forgot to redeploy (Step 7). Double-check both.
- **"Failed to fetch" / data won't save** → re-check the SQL ran successfully (Step 2) and
  that your URL/key are pasted correctly with no extra spaces.
- **Works on Mac but not live** → almost always the Vercel env vars. They must be added in
  Vercel separately from `.env.local`.
- Stuck? Paste the error to Claude and we'll sort it.

Enjoy a bar that finally talks to all your guests at once. 🥃
