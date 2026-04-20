# Preact Runtime Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace React with Preact via `preact/compat` while preserving the current static offline-first PWA behavior and current user-visible flows.

**Architecture:** Keep the existing Vite SPA/PWA architecture and preserve current component boundaries. Migrate the runtime first by aliasing React imports to Preact compatibility packages, then adapt the test/tooling setup, and finally verify that the build, app behavior, and bundle budget still pass before deciding whether any product simplification is worth doing.

**Tech Stack:** Vite 8, TypeScript 6, Preact with `preact/compat`, Vitest, Testing Library, Biome, `vite-plugin-pwa`

---

## File Structure

### Files to modify

- `package.json`
  - Replace React dependencies with Preact dependencies and keep the existing scripts.
- `vite.config.ts`
  - Add Vite aliasing for `react`, `react-dom`, and `react/jsx-runtime` to Preact compatibility modules while preserving the current PWA config.
- `tsconfig.app.json`
  - Add path aliases so TypeScript resolves React imports to Preact-compatible types.
- `tests/setup.ts`
  - Keep shared test setup working after the runtime swap.
- `tests/app.test.tsx`
  - Keep the current behavioral migration safety net passing under Preact.
- `src/main.tsx`
  - Keep the app bootstrap working under the compat alias strategy.
- `README.md`
  - Update the tech/runtime description if it still refers to React.

### Files to create

- `tests/runtime-smoke.test.tsx`
  - Small runtime-specific smoke test that proves the app still mounts and keeps the current PWA bootstrap path harmless in tests.

### Files expected to remain unchanged unless migration reveals a compatibility issue

- `src/App.tsx`
- `src/features/**`
- `src/lib/**`
- `scripts/check-bundle-size.mjs`

---

### Task 1: Swap the Runtime Dependencies and Lock the Alias Strategy

**Files:**
- Modify: `package.json`
- Modify: `vite.config.ts`
- Modify: `tsconfig.app.json`
- Test: `tests/runtime-smoke.test.tsx`

- [ ] **Step 1: Write the failing runtime smoke test**

Create `tests/runtime-smoke.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import App from '../src/App';

describe('runtime smoke', () => {
  it('mounts the app shell', () => {
    render(<App />);

    expect(screen.getByRole('region', { name: /current spot/i })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /quick actions/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the new test to confirm the current baseline**

Run: `pnpm test tests/runtime-smoke.test.tsx`

Expected: PASS under the current React runtime. This confirms the smoke test is meaningful before touching the runtime.

- [ ] **Step 3: Replace React packages with Preact packages**

Update `package.json` dependencies to:

```json
{
  "dependencies": {
    "lucide-react": "^1.8.0",
    "preact": "^10.27.2",
    "workbox-window": "^7.4.0"
  },
  "devDependencies": {
    "@biomejs/biome": "^2.4.12",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.2",
    "@testing-library/user-event": "^14.6.1",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "jsdom": "^29.0.2",
    "typescript": "^6.0.3",
    "vite": "^8.0.8",
    "vite-plugin-pwa": "^1.2.0",
    "vitest": "^4.1.4"
  }
}
```

Notes:
- Keep `@testing-library/react` initially because the plan is to rely on `preact/compat` rather than rewrite the test layer in phase 1.
- Keep React type packages in phase 1 if needed to minimize friction; remove only if they become unnecessary after the runtime swap is stable.

- [ ] **Step 4: Add Vite aliasing for Preact compatibility**

Update `vite.config.ts` to include:

```ts
import path from 'node:path';

import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      react: 'preact/compat',
      'react-dom/test-utils': 'preact/test-utils',
      'react-dom/client': 'preact/compat/client',
      'react-dom': 'preact/compat',
      'react/jsx-runtime': 'preact/jsx-runtime',
      'react/jsx-dev-runtime': 'preact/jsx-dev-runtime',
    },
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/apple-touch-icon.png'],
      manifest: {
        name: 'Bike Storage Tracker',
        short_name: 'Bike Spot',
        description: 'Save and reopen the bike spot you last used.',
        start_url: '/',
        display: 'standalone',
        theme_color: '#15231d',
        background_color: '#f4f3ef',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        navigateFallback: 'index.html',
        globPatterns: ['**/*.{html,js,css,png,svg,webmanifest}'],
        runtimeCaching: [],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/setup.ts',
    testTimeout: 30000,
  },
});
```

- [ ] **Step 5: Add TypeScript path aliases**

Update `tsconfig.app.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "Bundler",
    "allowImportingTsExtensions": false,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "baseUrl": ".",
    "paths": {
      "react": ["./node_modules/preact/compat/"],
      "react/jsx-runtime": ["./node_modules/preact/jsx-runtime"],
      "react/jsx-dev-runtime": ["./node_modules/preact/jsx-dev-runtime"],
      "react-dom": ["./node_modules/preact/compat/"],
      "react-dom/*": ["./node_modules/preact/compat/*"]
    }
  },
  "include": ["src", "tests", "vite.config.ts"]
}
```

- [ ] **Step 6: Install dependencies**

Run: `pnpm install`

Expected: lockfile updates with `preact` and without direct `react` / `react-dom` runtime deps.

- [ ] **Step 7: Run the smoke test again**

Run: `pnpm test tests/runtime-smoke.test.tsx`

Expected: PASS under Preact compatibility aliasing.

- [ ] **Step 8: Commit**

Run:

```bash
git add package.json pnpm-lock.yaml vite.config.ts tsconfig.app.json tests/runtime-smoke.test.tsx
git commit -m "refactor: swap react runtime for preact compat"
```

---

### Task 2: Stabilize the App Bootstrap and Test Environment

**Files:**
- Modify: `src/main.tsx`
- Modify: `tests/setup.ts`
- Modify: `tests/app.test.tsx`
- Test: `tests/runtime-smoke.test.tsx`
- Test: `tests/app.test.tsx`

- [ ] **Step 1: Write a failing targeted app behavior run**

Run: `pnpm test tests/app.test.tsx -t "shows a simplified home screen with one main card and compact secondary actions"`

Expected: if compatibility gaps exist, this run may fail after the runtime swap. Use the failure as the guide for minimal fixes.

- [ ] **Step 2: Keep the bootstrap file compatible and minimal**

Target `src/main.tsx` content:

```tsx
import { registerSW } from 'virtual:pwa-register';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';
import './styles.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element #root was not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

registerSW({ immediate: true });
```

The file should remain unchanged unless the alias strategy requires a small import tweak. Prefer preserving the current structure.

- [ ] **Step 3: Keep the shared test setup minimal**

Target `tests/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

If a Preact-specific setup hook is required, add only the smallest needed adjustment and avoid widening the test harness.

- [ ] **Step 4: Update app tests only where runtime behavior truly differs**

Preserve `tests/app.test.tsx` as the migration contract. Only change assertions if a runtime-specific difference is harmless and intentional. Do not weaken coverage.

Example acceptable test adjustment pattern:

```tsx
expect(screen.getByRole('dialog', { name: /recent locations/i })).toBeInTheDocument();
```

Example unacceptable adjustment:

```tsx
expect(screen.queryByRole('dialog')).toBeTruthy();
```

- [ ] **Step 5: Run the smoke test and the full app suite**

Run:

```bash
pnpm test tests/runtime-smoke.test.tsx
pnpm test tests/app.test.tsx
```

Expected:
- smoke test passes
- app behavior suite passes without feature loss

- [ ] **Step 6: Commit**

Run:

```bash
git add src/main.tsx tests/setup.ts tests/app.test.tsx
git commit -m "test: stabilize preact runtime behavior"
```

---

### Task 3: Verify Repository, PWA, and Non-UI Behavior Still Hold

**Files:**
- Modify: `README.md`
- Test: `tests/repository.test.ts`
- Test: `tests/overlay-state.test.ts`
- Test: `tests/bundle-budget.test.ts`

- [ ] **Step 1: Run the repository and non-UI regression suite**

Run:

```bash
pnpm test tests/repository.test.ts
pnpm test tests/overlay-state.test.ts
pnpm test tests/bundle-budget.test.ts
```

Expected: PASS. If any fail, fix only the compatibility issue, not the product behavior.

- [ ] **Step 2: Update docs to stop referring to React as the runtime**

If `README.md` names React directly, update the relevant section to something like:

```md
## Development

This app is a static Vite-powered PWA using Preact-compatible client rendering, local persistence, and Workbox-based offline support.
```

Keep deployment docs serverless/static-hosting friendly.

- [ ] **Step 3: Re-run the focused regression suite**

Run:

```bash
pnpm test tests/repository.test.ts
pnpm test tests/overlay-state.test.ts
pnpm test tests/bundle-budget.test.ts
```

Expected: PASS.

- [ ] **Step 4: Commit**

Run:

```bash
git add README.md
git commit -m "docs: update runtime description for preact"
```

---

### Task 4: Run Full Verification and Compare Bundle Output

**Files:**
- Modify: none unless verification exposes a real bug
- Test: full project verification

- [ ] **Step 1: Run lint**

Run: `pnpm lint`

Expected: PASS with no fixes required.

- [ ] **Step 2: Run the full test suite**

Run: `pnpm test`

Expected: PASS for all tests, including current app behavior and repository tests.

- [ ] **Step 3: Run the production build**

Run: `pnpm build`

Expected:
- TypeScript passes
- Vite build succeeds
- PWA assets generate successfully
- bundle-budget script passes

- [ ] **Step 4: Record the bundle comparison**

Capture the new emitted sizes from `pnpm build` and compare them to the current React baseline:

Current baseline:

```txt
dist/assets/index-B_ZEoYU7.js 221.99 kB raw / 68.79 kB gzip
dist/assets/index-B30NJwlS.css 10.72 kB raw / 3.04 kB gzip
```

Add a short verification note in the implementation summary:

```md
- React baseline JS: 221.99 kB raw / 68.79 kB gzip
- Preact migration JS: <new value>
- Result: <smaller / unchanged / worse>
```

- [ ] **Step 5: If verification fails, fix the narrowest issue and rerun the exact failing command**

Do not batch speculative fixes. Follow TDD discipline:

```bash
pnpm test <failed-target>
pnpm build
```

- [ ] **Step 6: Commit**

Run:

```bash
git add -A
git commit -m "chore: verify preact migration end to end"
```

---

### Task 5: Post-Migration Checkpoint

**Files:**
- Modify: none
- Test: review output and code state

- [ ] **Step 1: Summarize the migration outcome**

Prepare a short summary with:

```md
- static hosting preserved: yes/no
- offline-first preserved: yes/no
- behavior parity preserved: yes/no
- full verification passed: yes/no
- bundle size improved: yes/no
```

- [ ] **Step 2: Decide whether to stop or propose phase 2**

Decision rule:

- Stop if the runtime swap is clean and the bundle/runtime improvement is worthwhile.
- Only propose phase 2 if:
  - the size win is underwhelming, or
  - `preact/compat` leaves awkward code/tooling friction, or
  - one secondary flow is clearly disproportionate in complexity.

- [ ] **Step 3: If phase 2 is proposed, present user-approved simplification candidates without implementing them**

Candidate format:

```md
1. Simplify recent preview flow
2. Simplify station settings flexibility
3. Simplify photo-related UI/state flow
```

Do not change behavior further without explicit approval.

---

## Self-Review

### Spec coverage

- Static hosting preserved: covered by Tasks 1, 3, and 4.
- Offline-first PWA preserved: covered by Tasks 1 and 4.
- No up-front feature cuts: enforced across Tasks 2 through 5.
- Existing tests remain the migration contract: covered by Tasks 2 through 4.
- Bundle budget and build stay in place: covered by Task 4.
- Post-migration simplification checkpoint: covered by Task 5.

### Placeholder scan

- No `TODO` or `TBD` placeholders remain.
- Every task includes exact files and exact commands.
- Steps that change code include concrete code targets or exact constraints.

### Type consistency

- Runtime aliasing consistently targets `preact/compat`, `preact/compat/client`, `preact/jsx-runtime`, and `preact/jsx-dev-runtime`.
- Verification commands consistently use `pnpm`.

