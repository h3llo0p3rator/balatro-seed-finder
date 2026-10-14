# Balatro seed finder

A GitHub Pages site that searches Balatro 1.0.1+ shop, Buffoon pack, and The Soul queues (Red Deck, White Stake, completed profile) using the same LuaJIT streams the game does.

Live site after Pages is enabled: [https://h3llo0p3rator.github.io/balatro-seed-finder/](https://h3llo0p3rator.github.io/balatro-seed-finder/)

The original Cursor canvas is preserved in `balatro-seed-finder.canvas.tsx`.

## Enable GitHub Pages

The deploy workflow lives in `.github/workflows/deploy.yml` and publishes on every push to `main`.

1. Merge this branch to `main`.
2. In the repo, open Settings, then Pages.
3. Under Build and deployment, set Source to GitHub Actions.

The first deploy creates the `github-pages` environment. After that, the site is at `https://h3llo0p3rator.github.io/balatro-seed-finder/`.

## Local development

npm install
npm run dev

The Vite base path is `/balatro-seed-finder/`, so open `http://localhost:5173/balatro-seed-finder/`.

npm run build
npm run preview
