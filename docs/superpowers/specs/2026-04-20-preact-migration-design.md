# Preact Migration Design

## Summary

Migrate the app from React to Preact using `preact/compat`, while preserving the current static-hosted, offline-first architecture and current user-visible behavior in phase 1. Do not introduce server requirements, SSR, or route-level architectural changes. Keep the current PWA and storage model intact.

The migration goal is to reduce framework/runtime weight with the lowest-risk path available for this repo. Product simplification is explicitly deferred until after the migration has been verified and measured.

## Recommendation

Use a conservative compatibility migration, not a rewrite:

- Replace `react` and `react-dom` with Preact-compatible equivalents.
- Alias `react`, `react-dom`, and `react/jsx-runtime` to `preact/compat` and `preact/jsx-runtime`.
- Preserve the current component tree, state boundaries, storage logic, and PWA flow during phase 1.
- Keep current features, including station settings, recent preview, and photo support.
- Add a post-migration checkpoint to decide whether any modest product simplification is justified.

This is the preferred path because the app is static-only and offline-first, and the user prefers simplicity over a speculative framework rewrite.

## Current App Constraints

- Static-hosted app with no server requirement.
- Offline-first behavior is acceptable and should remain the primary delivery model.
- Local persistence remains client-side only.
- Current test suite is the behavioral safety net and should remain central to the migration.
- The bundle budget check introduced in the current build flow remains in place and should continue to gate production builds.

## Architecture

### Runtime and Build

- Keep Vite as the build tool.
- Keep the app as a client-rendered SPA/PWA.
- Replace React runtime dependencies with Preact equivalents.
- Configure compatibility aliasing in Vite and TypeScript so existing React-style imports continue to work during the migration.
- Keep the existing PWA plugin and static output shape.
- Keep the bundle budget script as part of the `build` script.

### App Structure

- Preserve the current `App` entrypoint and current top-level architecture.
- Preserve the current split between:
  - app shell / overlay orchestration
  - feature components
  - local domain and draft helpers
  - repository/persistence logic
- Do not rewrite components to native Preact APIs in phase 1 unless a specific compatibility issue requires it.
- Prefer keeping existing JSX and current component interfaces intact.

### Storage and Offline Model

- Preserve current local persistence behavior, including app data and photo storage.
- Preserve current service worker registration and generated manifest/service worker output.
- Do not introduce remote APIs, remote data sync, or server-backed routes.

## Public Behavior

Phase 1 keeps behavior stable:

- Current screen layout and flow remain intact.
- Current overlay behavior remains intact.
- Station settings remain intact.
- Recent location preview flow remains intact.
- Photo support remains intact.

No product simplification is included in this phase by default.

## Tooling Changes

- Update dependencies from React packages to Preact packages.
- Remove React-specific type packages once no longer needed.
- Add any required Preact-compatible type or config changes.
- Keep Vitest.
- Keep Testing Library-style tests, adapting the setup only as needed for Preact compatibility.
- Keep Biome and the existing bundle-budget script.

## Testing Strategy

Use the current behavior tests as the migration contract.

Required verification:

- app shell renders correctly
- change location flow still works
- station settings flow still works
- outside mode with notes/photo still works
- current-location details still work
- recent locations and recent preview still work
- click-outside and close-button behavior still work
- local persistence tests still work
- overlay-state and bundle-budget tests still work

Required commands:

- `pnpm lint`
- `pnpm test`
- `pnpm build`

## Compatibility Risks

The main migration risks are runtime compatibility details, not product architecture:

- event behavior differences between React and native Preact
- test-environment differences after swapping the runtime
- dialog/focus behavior changes in modal/sheet flows
- subtle form/input behavior differences

Mitigation:

- use `preact/compat` first rather than native Preact APIs
- avoid mixing runtime migration with product simplification
- rely on current behavioral tests before making cleanup changes

## Decision Checkpoint After Migration

After phase 1 is complete and verified:

- Compare bundle output against the current React-based baseline.
- Review whether the codebase is simpler, the same, or more awkward under `preact/compat`.
- Decide whether to stop or do a second pass.

Phase 2 only happens if the migration is successful and a simplification opportunity is clearly worthwhile.

Likely phase-2 candidates, if needed:

- simplify recent preview flow
- simplify station settings flexibility
- simplify photo-related UI/state flow

Do not pre-commit to removing any of these. Run them by the user first.

## Acceptance Criteria

Phase 1 is complete when all of the following are true:

- the app still builds to static assets only
- no server hosting requirement has been introduced
- offline-first behavior remains intact
- existing user-visible flows still work
- lint, tests, and build all pass
- bundle budget check passes
- the produced runtime bundle is smaller than the React version, or at minimum not materially worse

## Assumptions

- Static hosting remains the desired deployment model.
- SSR and server routes are out of scope.
- Behavior parity is more important than aggressive cleanup during phase 1.
- Product simplification, if any, will be a separate user-approved step after migration measurement.
