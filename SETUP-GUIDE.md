# 🥃 Trixon — Mac Setup & Deploy Guide

Welcome! This guide takes you from zero to a **live Trixon website on your own URL**.
No prior coding experience needed. You'll copy/paste a handful of commands.

Take it one step at a time. If anything prints a scary-looking message, copy it and
send it to Claude — that's exactly how we troubleshoot.

Throughout this guide, **Terminal** is the black-and-white app on your Mac. Open it via
Spotlight: press `⌘ + Space`, type **Terminal**, hit Enter.

---

## Part 1 — One-Time Setup (≈30–45 min, only ever done once)

### Step 1.1 — Install Homebrew (the installer for developer tools)

Paste this into Terminal and press Enter:

```
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

- It may ask for your Mac password (the one you log in with). Type it — you won't see
  characters appear, that's normal — and press Enter.
- This takes a few minutes. When it finishes, **close Terminal and reopen it.**

> 💡 After it installs, Homebrew may print two lines starting with `echo` and asking you
> to run them ("Next steps"). If it does, copy/paste/run those two lines. If you're not
> sure, paste what you see to Claude.

### Step 1.2 — Install Node.js

```
brew install node
```

When done, verify it worked:

```
node --version
```

You should see something like `v20.x.x` or `v22.x.x`. Any version number = success. ✅

### Step 1.3 — Install Git

```
brew install git
```

Verify:

```
git --version
```

A version number means you're good. ✅

---

## Part 2 — Get Trixon Running on Your Mac (≈10 min)

### Step 2.1 — Put the project somewhere easy

Move the `trixon-app` folder (the one this guide came in) to your **Desktop** so it's easy to find.

### Step 2.2 — Open the project in Terminal

In Terminal, type `cd ` (c, d, space) — **then drag the `trixon-app` folder from your
Desktop into the Terminal window** and press Enter. This "moves into" the project folder.

Your prompt should now show `trixon-app`. To confirm you're in the right place:

```
ls
```

You should see `package.json`, `index.html`, `src`, etc. listed. ✅

### Step 2.3 — Install the building blocks

```
npm install
```

This downloads everything the app needs (creates a `node_modules` folder). Takes a minute
or two. A few warnings in yellow are normal — only red **errors** matter.

### Step 2.4 — Preview Trixon live on your Mac! 🎉

```
npm run dev
```

You'll see a line like:

```
  ➜  Local:   http://localhost:5173/
```

Hold **⌘** and click that link (or copy it into your browser). **Trixon is now running
on your computer.** Edit, test, play around.

- To see the **guest view**, add `#guest` to the URL: `http://localhost:5173/#guest`
- To **stop** the preview, click Terminal and press `Control + C`.

> This is your safety net: anytime Claude gives you updated code, you preview it here
> FIRST, and only publish once it looks right.

---

## Part 3 — Put Trixon on the Internet (≈20 min, one-time)

We'll use **GitHub** (stores your code) + **Vercel** (hosts it, free).

### Step 3.1 — Create a GitHub account

Go to https://github.com and sign up (free). Remember your username.

### Step 3.2 — Create a new repository

1. Click the **+** (top right) → **New repository**.
2. Name it `trixon`.
3. Leave everything else default. Click **Create repository**.
4. Leave that page open — you'll need the commands it shows.

### Step 3.3 — Connect your project and push it up

Back in Terminal (still inside `trixon-app`), run these **one at a time**.
First-time Git setup (replace with your info):

```
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

Then:

```
git init
git add .
git commit -m "Trixon v1"
git branch -M main
```

Now connect to GitHub. **Copy the line from your GitHub page** that looks like the one
below (it has YOUR username), or edit this one:

```
git remote add origin https://github.com/YOUR-USERNAME/trixon.git
git push -u origin main
```

- The first push will pop open a browser window to **authorize GitHub** — click through
  to sign in. Once authorized, the push completes.
- Refresh your GitHub repo page — your files are now there! ✅

### Step 3.4 — Deploy on Vercel

1. Go to https://vercel.com and **Sign up with GitHub** (one click).
2. Click **Add New… → Project**.
3. Find your `trixon` repo and click **Import**.
4. Don't change any settings — Vercel auto-detects Vite. Click **Deploy**.
5. Wait ~60 seconds. 🎉 **You'll get a live URL like `trixon-xyz.vercel.app`.**

Your app is now on the internet. Open that URL on your phone — add `#guest` to see the
guest menu, and try the QR code in the admin Share tab.

---

## Part 4 — Use Your Own Domain (optional, ≈15 min)

1. Buy a domain at https://www.namecheap.com or https://dash.cloudflare.com (~$10/yr).
2. In Vercel: open your project → **Settings → Domains** → type your domain → **Add**.
3. Vercel shows you 1–2 DNS records to add. Go to your domain registrar's DNS settings
   and add exactly those records.
4. Wait a few minutes (sometimes longer). Vercel auto-adds free HTTPS. Done — Trixon
   lives on your domain. ✅

---

## Part 5 — The Update Loop (how you'll make changes going forward)

Whenever Claude gives you updated code:

1. Replace the file(s) in `trixon-app` with the new version.
2. Preview locally:
   ```
   npm run dev
   ```
   Check it looks right, then stop with `Control + C`.
3. Publish:
   ```
   git add .
   git commit -m "describe your change"
   git push
   ```
4. Vercel automatically rebuilds. Your live site updates in about a minute. ✨

That's it. **Dream it up → paste → preview → push → live.**

---

## Important Notes

- **Right now Trixon saves data per-device** (localStorage). For the live multi-phone
  experience — where a guest's request reaches YOUR queue — we add **Supabase** as a
  shared database. That's the recommended next step once hosting works. Just ask Claude:
  "let's set up Supabase."
- **Add Trixon to your iPhone:** open your live URL in Safari → Share button → **Add to
  Home Screen**. It gets the gold TH icon and runs full-screen like a real app.
- **Stuck on any step?** Copy whatever Terminal printed and send it to Claude. Truly —
  that's the fastest way through any bump.

Enjoy Trixon! 🥃
