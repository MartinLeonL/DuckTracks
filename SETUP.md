# DuckTracks — Setup Guide

## Part 1: Local Project Initialization

```bash
# 1. Create Vite + React project 
npm create vite@latest ducktracks -- --template react
cd ducktracks

# 2. Install Tailwind CSS
npm install -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p

# 3. Install app dependencies
npm install @supabase/supabase-js lucide-react

# 4. Install PWA plugin
npm install -D vite-plugin-pwa workbox-window
```

### Tailwind config — tailwind.config.js
```js
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: { extend: {} },
  plugins: [],
};
```

### src/index.css — add at top
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## Part 2: Supabase Database Setup

In the Supabase dashboard → SQL Editor, run:

```sql
-- Create rubber duckies table
create table rubber_duckies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  rarity text not null check (rarity in ('common','rare','epic','legendary','mythic')),
  sprite_row integer not null default 0,
  sprite_col integer not null default 0,
  created_at timestamptz default now()
);

-- Enable public read access (no auth needed for metadata)
alter table rubber_duckies enable row level security;
create policy "Public read" on rubber_duckies for select using (true);

-- Seed sample ducks (replace with your real duck names)
insert into rubber_duckies (name, rarity, sprite_row, sprite_col) values
  ('Puddles',         'common',    0, 0),
  ('Sunny',          'common',    0, 1),
  ('Ripple',         'common',    0, 2),
  ('Bubbles',        'common',    0, 3),
  ('Waddles',        'common',    0, 4),
  ('Skipper',        'rare',      1, 0),
  ('Admiral',        'rare',      1, 1),
  ('Sapphire',       'rare',      1, 2),
  ('Neptune',        'rare',      1, 3),
  ('Cobalt',         'epic',      2, 0),
  ('Mystic',         'epic',      2, 1),
  ('Phantom',        'epic',      2, 2),
  ('Specter',        'epic',      2, 3),
  ('Gilded',         'legendary', 3, 0),
  ('Solaris',        'legendary', 3, 1),
  ('Aurum',          'legendary', 3, 2),
  ('Crimson',        'mythic',    4, 0),
  ('Inferno',        'mythic',    4, 1);

-- Rarity mastery trophy ducks (these allow duplicates)
insert into rubber_duckies (name, rarity, sprite_row, sprite_col) values
  ('The Common Master Duck',    'common',    5, 0),
  ('The Rare Master Duck',      'rare',      5, 1),
  ('The Epic Master Duck',      'epic',      5, 2),
  ('The Legendary Master Duck', 'legendary', 5, 3),
  ('The Mythic Master Duck',    'mythic',    5, 4);
```

### Supabase Storage
1. Go to Storage → Create bucket named `assets`
2. Set bucket to **public**
3. Upload your `spritesheet.png` to the `assets` bucket
4. Copy the public URL — it will look like:
   `https://<project>.supabase.co/storage/v1/object/public/assets/spritesheet.png`
5. Set this as `VITE_SUPABASE_SPRITE_URL` in your `.env`

---

## Part 3: Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_SUPABASE_SPRITE_URL=https://your-project.supabase.co/storage/v1/object/public/assets/spritesheet.png
```

---

## Part 4: PWA Configuration

The `vite.config.js` in this project already includes `vite-plugin-pwa`. The manifest is configured with:
- `display: "standalone"` — hides browser chrome on iOS/Android
- `theme_color` and `background_color` set to match the app palette
- Icons at 192×192 and 512×512 (place them in `/public/icons/`)

### To install on iPhone:
1. Open Safari → navigate to your deployed URL
2. Tap Share → "Add to Home Screen"

### To install on Android / Desktop Chrome:
1. Visit the URL
2. Chrome shows an install prompt in the address bar

---

## Part 5: Running the App

```bash
npm run dev        # Development server
npm run build      # Production build
npm run preview    # Preview production build locally
```
