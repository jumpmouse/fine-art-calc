# PWA Setup (Web)

This document explains how Fine Art Calc is configured as a PWA and how to customize it.

## What we added
- `public/manifest.json` – app name, colors, and icon declarations (including maskable icons).
- `public/index.html` – links the manifest and apple-touch-icon; registers `sw.js` service worker.
- `workbox-config.js` – Workbox settings to generate `dist/sw.js` after export.
- `package.json` scripts:
  - `build:web` → `expo export --platform web`
  - `build:web:pwa` → `npm run build:web && workbox generateSW workbox-config.js`

## Icons and images
- PWA icons live in `public/icons/`:
  - `icon-192.png`, `icon-512.png` (purpose: any)
  - `icon-192-maskable.png`, `icon-512-maskable.png` (purpose: maskable)
- Apple touch icon: `public/apple-touch-icon.png` (180×180)
- Favicon: comes from `app.json > web.favicon` → `./assets/favicon.png` (Expo emits `/favicon.ico`). You can override with `public/favicon.ico` if needed.

## Colors
- Manifest: `theme_color: "#2D9CDB"`, `background_color: "#FFFFFF"`.
- You can change these in `public/manifest.json`.

## Local build and verify
```bash
npm run build:web:pwa
npx serve -s dist   # or: npx http-server dist -p 5173
```
- Open the local URL in Chrome/Brave.
  - DevTools → Application → Manifest: verify icons and colors.
  - DevTools → Application → Service Workers: `sw.js` registered.
- Install the app from the browser menu.

## Deploy (Vercel)
- Settings:
  - Framework Preset: Other
  - Build Command: `npm run build:web:pwa`
  - Output Directory: `dist`

## iPhone install instructions
- Open the site in Safari → Share → Add to Home Screen.

## Updating icons
- Replace files in `public/icons/` and `public/apple-touch-icon.png`.
- Rebuild and redeploy.

## Customize offline behavior
- Edit `workbox-config.js`:
  - `globPatterns` to include/exclude files.
  - `runtimeCaching` strategies (e.g., `NetworkFirst`, `CacheFirst`).
- Re-run `npm run build:web:pwa`.
