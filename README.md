# Trixon 🥃

A private home-bar manager with a speakeasy aesthetic. Track bottle inventory, store
cocktail recipes, and give guests a QR-code menu they can order from — with a live drink
queue on the admin side.

## Quick start

```
npm install
npm run dev
```

Open the printed `localhost` URL. Add `#guest` to the URL to see the guest menu.

**New here? Read `SETUP-GUIDE.md` for the full step-by-step (install → live website).**

## Features

- **Inventory** — visual fill meters, full-bar category dropdown, low-stock flags,
  categorized shopping list with check-off
- **Recipes** — ingredients + measurements, bartender notes, custom groups, drag-free
  reordering, guest descriptions
- **Guest menu** — grouped sections with headers, beer/cider pulled live from inventory,
  custom drink requests
- **Queue** — live, numbered drink requests; mark complete to clear
- **Share** — QR code + link to the guest menu

## Tech

- React 18 + Vite
- Data currently in localStorage (swap to Supabase for multi-device sync — ask Claude)

## Deploy

Push to GitHub, import into Vercel. See `SETUP-GUIDE.md` Part 3.
