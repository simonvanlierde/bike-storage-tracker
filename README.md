# Bike Storage Tracker

Bike Storage Tracker is a small offline-first web app for saving where you parked your bike.

It stores the current bike spot, keeps a short recent history, and lets you restore an older location when needed. Everything stays client-side in the browser.

## Local Development

Requirements: Node.js 24 and `pnpm`.

```bash
pnpm install
pnpm dev
```

The app runs as a static Vite + Preact PWA. App state lives in local storage, photo blobs live in IndexedDB, and the service worker/manifest are generated during the production build.

## Quality Gates

```bash
pnpm lint
pnpm test
pnpm build
```

For the full local gate:

```bash
pnpm check
```

`pnpm build` relies on Vite's chunk-size warning for oversized bundles.

## Deployment

Deploy with Cloudflare Pages using the repo’s native Pages integration.

Recommended Pages settings:

- Framework preset: `None`
- Build command: `pnpm build`
- Build output directory: `dist`
- Production branch: `main`

The repo keeps GitHub Actions for verification only. Cloudflare Pages is the deploy system of record.

## Architecture

- `src/features/app` owns app-level orchestration such as hydration, persistence timing, and sheet state.
- `src/lib` owns domain state transitions, defaults, persistence, and photo storage.
- `src/features/**` and `src/components/**` own the UI for editing, previewing, and restoring locations.
- The PWA shell stays static-hosted; no server, SSR, or remote sync is involved.

Released under the [MIT License](LICENSE).
