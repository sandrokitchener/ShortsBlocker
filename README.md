# ShortsBlocker

`No More Reels` is the current extension name for this early Chrome-first prototype focused on removing short-form video surfaces before they can grab attention.

## Stack

- WXT
- TypeScript
- Tailwind CSS
- UIkit
- `@webext-core/messaging`

## Feasibility

This is feasible as a browser extension, with some real limits:

- We can redirect obvious direct routes like YouTube Shorts and Instagram or Facebook Reels before the full page takes over.
- We can hide or remove short-video shelves, cards, and modules that appear inside normal feeds by scanning and mutating the DOM as those sites render.
- We should not rely on parsing private response bodies from extension JavaScript. Chrome's current extension model is strongest when we use declarative request rules plus content scripts.

That makes the strongest first version:

1. Intercept direct short-video routes with declarative rules.
2. Strip short-video cards and modules out of normal feeds with content scripts.
3. Keep the selectors and heuristics easy to swap when sites change their markup.

## Current MVP

This build currently targets:

- YouTube Shorts routes and common Shorts surfaces
- Instagram Reels routes and reel links
- Facebook Reels routes and reel links
- LinkedIn "Videos for you" style modules using text-plus-video heuristics

## Project Shape

- `wxt.config.ts`: WXT config plus Tailwind Vite plugin
- `entrypoints/background`: service worker that stores per-tab state
- `entrypoints/content`: DOM stripping logic for supported sites
- `entrypoints/popup`: extension popup with live status and rescan action
- `entrypoints/blocked`: redirect destination for direct Shorts or Reels routes
- `utils/messaging.ts`: typed message protocol built on `@webext-core/messaging`
- `public/rules.json`: declarative route rules used by Chrome

## Local Dev

1. Run `npm install`.
2. Run `npm run build` for a production bundle, or `npm run dev` while iterating.
3. Load the generated Chrome build from `.output/chrome-mv3/`.

## Current Limits

- Site markup changes will break selectors, especially on YouTube and LinkedIn.
- LinkedIn support is intentionally conservative because its short-video UI is less standardized on desktop.
- This is Chrome-first by design right now, even though WXT gives us a clean path to broader browser support later.

## Good Next Steps

- Add per-site toggles and persistence
- Record which heuristics fired so debugging selector drift is easier
- Add lightweight regression tests around the site-specific detection rules
- Publish signed builds after real-world selector tuning
