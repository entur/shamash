# GraphiQL 1.x → 5.x Migration (unblocks React 19)

**Date:** 2026-06-21
**Status:** Approved design — ready for implementation planning

## Problem

Upgrading React 18 → 19 (renovate PR #432) crashes the app at runtime:

```
Uncaught TypeError: Cannot read properties of undefined (reading 'ReactCurrentOwner')
```

### Root cause

The app's main component imports the legacy monolith `graphiql@1.11.5`
(`src/components/App/App.tsx`: `import GraphiQL from 'graphiql'`). That package
bundles its own nested `@graphiql/react@0.10.0`, whose module init reads
`React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner`.
React 19 removed that internal (renamed to `__CLIENT_INTERNALS_…`), so the object
is `undefined` and the property access throws. `graphiql@1.11.5`'s own
`peerDependencies` declare `react: ^16 || ^17 || ^18` — React 19 is unsupported.

`framer-motion@12.23.12` (via the modern `@graphiql/react@0.37.3`) was ruled out:
the only files referencing the old internal are its legacy standalone bundles
(`dist/framer-motion.js`), which are **not** in its `exports` map. Vite loads
`dist/es/index.mjs`, which is clean.

**Conclusion:** React 19 is blocked on migrating off the legacy `graphiql@1.x`
monolith to modern modular GraphiQL 5.x. They must land together. `graphiql@5.2.4`
peers `react: ^18 || ^19`, so the migration unblocks React 19.

## Goals

- Replace `graphiql@1.11.5` with `graphiql@5.x` and land React 19 in the same change.
- Preserve all Entur-specific behavior (services, environments, examples, map,
  geocoder, subscriptions, logo, footer).
- **Adopt GraphiQL 5 built-ins wherever they exist** (prettify, history, theming,
  explorer) rather than re-implementing them. Minor visual/affordance shifts are
  acceptable.

## Non-goals

- No new features. No unrelated refactoring.
- Not continuing WIP PR #269 as a branch (see below) — only porting parts from it.
- Minify button is **dropped** (GraphiQL 5 has no built-in minify).

## Decisions (locked during brainstorming)

1. **Parity bar:** adopt GraphiQL 5 built-ins where they exist; keep only
   Entur-specific custom UI.
2. **PR #269 (WIP "GraphiQL 3"):** use as reference and parts donor only; build
   fresh on current `master`. Reasons: it targets v3 (not v5), branched from a
   months-old master and would regress newer `App.tsx` features (subscription
   lifecycle, example-by-URL short links, service redirects), and is incomplete /
   conflicting. Close #269 once this lands.
3. **Architecture:** single `<GraphiQL>` with its `Logo`/`Toolbar`/`Footer` slots
   plus a `CustomDropdown` for menus (Approach A), over low-level
   `GraphiQLProvider`/`GraphiQLInterface` composition (Approach B).

## GraphiQL 5 API facts (verified against graphiql@5.2.4 / @graphiql/react@0.37.3)

- `import { GraphiQL } from 'graphiql'` — named export. `GraphiQL` is an `FC` with
  static `.Logo`, `.Toolbar`, `.Footer`. **`.Button` / `.Menu` / `.MenuItem` are
  removed.**
- `GraphiQL.Toolbar` accepts a **render-prop** child:
  `({ prettify, copy, merge }) => ReactNode` (built-in toolbar actions), or plain
  `ReactNode`.
- **No imperative `ref` API.** State lives in a Zustand store accessed via
  `@graphiql/react` hooks: `useEditorContext`, `useExecutionContext`,
  `useSchemaContext`, `useTheme`, `usePrettifyEditors`, `useGraphiQLActions`,
  `useGraphiQL`, etc. Hooks must be called inside the provider tree (i.e., a child
  of `<GraphiQL>`).
- Props (from `GraphiQLProvider`): `fetcher` (required), `schema`, `plugins`,
  `visiblePlugin`, `query` (**initial**, uncontrolled), `variables`, `headers`,
  `operationName`, `onEditQuery`, `onEditVariables`, `onEditHeaders`,
  `onEditOperationName`, `defaultTheme`, `forcedTheme`, `defaultQuery`.
- **Editor engine is Monaco** (was CodeMirror). Requires worker setup; GraphiQL 5
  ships a Vite helper: side-effect `import 'graphiql/setup-workers/vite'`.
- CSS: `graphiql/style.css` (replaces `graphiql/graphiql.css`).
- Explorer: `import { explorerPlugin } from '@graphiql/plugin-explorer'`
  (`explorerPlugin(): GraphiQLPlugin`) + `@graphiql/plugin-explorer/style.css`.

## Architecture (Approach A)

A single `<GraphiQL>` in `App.tsx`:

- `plugins={[explorerPlugin()]}` (memoized).
- `fetcher={customFetcher}`, `schema={schema}`, `query`/`variables`/`operationName`
  as initial values, `onEdit*` synced to the URL via the existing `editParameter`.
- `<GraphiQL.Logo>` — Entur logo (swaps with theme).
- `<GraphiQL.Toolbar>` render-prop — built-in `prettify`/`copy`/`merge` plus
  Entur custom controls.
- `<GraphiQL.Footer>` — current service name + URL.
- A small inner `GraphiQLController` child (inside the provider tree) for the few
  store/theme-dependent needs (theme-based logo source via `useTheme`).

### New / ported components

- `CustomDropdown.tsx` (+ `.module.css`) — ported from #269. Replaces
  `GraphiQL.Menu`/`MenuItem` for Service, Environment, and Examples menus.
- `MapPortal.tsx` (+ `.module.css`) — ported from #269. Portal overlay hosting
  `MapView` for the Map toggle.
- `GraphiQLController.tsx` — small inner component using `@graphiql/react` hooks
  (theme/logo); created fresh.

### Removed

- `graphiql-explorer` dependency and `import { Explorer }`.
- `DarkmodeExplorerColors`, custom dark-theme CSS toggling via `body.dark-theme`,
  and the Theme `GraphiQL.Menu` (replaced by built-in theming / `useTheme`).
- Custom Prettify / Minify / History button handlers and the imperative
  `graphiql.current.*` calls.
- The `.execute-button` SVG-morphing `useEffect` (subscription run/stop indicator)
  — GraphiQL 5's run button natively switches to a stop button during active
  execution/subscriptions.

## Feature mapping

| Today (graphiql 1.x) | GraphiQL 5 plan |
|---|---|
| `import GraphiQL from 'graphiql'` | `import { GraphiQL } from 'graphiql'` |
| `ref` imperative API (`getQueryEditor`, `getVariableEditor`, `handleRunQuery`, `setState({historyPaneOpen})`) | removed; built-ins + `@graphiql/react` hooks |
| Custom Prettify button | built-in `prettify` from `GraphiQL.Toolbar` render-prop |
| Custom Minify button | **dropped** (no built-in) |
| Custom History button | built-in History plugin |
| `graphiql-explorer` sidebar + `DarkmodeExplorerColors` | `explorerPlugin()` via `plugins` |
| Custom dark CSS + `body.dark-theme` + Theme menu | built-in theming (`defaultTheme` / `useTheme`) |
| Service / Environment / Examples menus (`GraphiQL.Menu`) | `CustomDropdown` in `GraphiQL.Toolbar` |
| Map button + `MapView` | Map toolbar button + `MapPortal` overlay |
| Geocoder "Search for ID" | toolbar button → existing `GeocoderModal` (unchanged) |
| Logo / Footer | `GraphiQL.Logo` / `GraphiQL.Footer` (kept) |
| Subscription run/stop SVG DOM hack | dropped (native stop button) |

## URL deep-linking (HARD REQUIREMENT)

Deep-linking is a core feature and must be fully preserved: the `query`,
`variables`, and `operationName` (plus the example short-link `example`) live in
the URL query string, so a shared/bookmarked URL reproduces the exact editor
state. The URL is the **source of truth**.

Current mechanism (must be kept working):
- `ConnectedApp` parses `window.location.search` into `parameters` and re-parses
  on `popstate` and on a 500 ms path/search poll.
- `editParameter(key, value)` writes back via
  `history.replace({ search: queryString.stringify(...) })`, with special handling
  so selecting an example keeps the short `?example=…` URL until the user edits
  (tracked by `loadedExampleQuery`/`loadedExampleVariables` refs).

v5 wiring for deep-linking (verified against `@graphiql/react@0.37.3`):
- **Inbound:** seed `initialQuery` / `initialVariables` (and `operationName`) from
  the parsed URL params on mount.
- **Outbound:** v5 exposes `onEditQuery`, `onEditVariables`, **and
  `onEditOperationName`** — wire each to the existing `editParameter` so every edit
  syncs to the URL exactly as today.

**Hazard — persisted storage vs. URL precedence:** v5 persists tab state (query,
variables, headers) in `localStorage`, and `initialQuery`/`initialVariables` apply
"only if there is no tab state persisted in storage." A return visit could
therefore restore the last session's editor contents and **silently override a URL
deep-link**. This must not happen. Mitigations to evaluate during implementation
(pick the simplest that passes a deep-link test):
1. `disableTabs` (as WIP #269 did) to avoid multi-tab persisted state, and/or
2. force the URL to win by remounting GraphiQL with a `key` derived from the
   deep-link payload (service + query/variables/example), and/or
3. seed/replace the persisted tab state from the URL on mount, and/or
4. constrain or namespace the `storage` prop so persisted state never shadows an
   explicit URL query.

**Acceptance test (must pass):** opening a fresh browser (clean storage) AND a
returning browser (populated storage) at a URL containing `query` + `variables`
both render exactly those contents; editing the query/variables/operation updates
the URL; copying the URL and reopening reproduces the state. Covered by an
automated test plus the manual smoke test.

## Data flow

- **Query/variables/operationName:** seeded from the URL as initial store values
  (see URL deep-linking above). Service-switch and example-select already navigate
  via `window.location` (full reload → remount with the new initial values), so the
  loss of controlled `query` does not change behavior.
  `onEditQuery`/`onEditVariables`/`onEditOperationName` sync edits back to the URL
  through `editParameter`.
- **Response → Map:** keep the `customFetcher` wrapper that records each response
  into `response` state; `MapView` consumes it. Subscriptions (graphql-ws) keep
  flowing through the same wrapper (observable branch unchanged).
- **Schema:** unchanged — introspection on fetcher change, `buildClientSchema`,
  passed as `schema` prop.

## Build / entry changes

- `src/index.tsx`: add side-effect `import 'graphiql/setup-workers/vite'`.
- Swap CSS imports: `graphiql/style.css` + `@graphiql/plugin-explorer/style.css`;
  remove `graphiql/graphiql.css`.
- `package.json`: bump `graphiql` → 5.x, `react`/`react-dom`/`react-test-renderer`
  → 19.x, `eslint-plugin-react-hooks` → 7.x (matching renovate #432); remove
  `graphiql-explorer`. Verify `vite.config` Monaco/worker handling.

## Testing

- Update `src/components/App/App.test.tsx` (currently mocks `graphiql-explorer`)
  to the new structure; mock `graphiql`/Monaco where jsdom can't run workers.
- Keep the existing 9 tests green. Add coverage only where the new wiring
  introduces non-trivial logic (e.g., `CustomDropdown` selection, example loading
  still drives the URL).
- **Deep-link test (required):** assert that initial `query`/`variables` from the
  URL render in the editors, that edits call `editParameter` (URL sync), and that
  persisted storage does not override a URL deep-link (the hazard above).
- Verify production build (`npm run build`) and a manual smoke test of the deploy
  preview: editor loads (Monaco), run query, explorer, history, theme toggle,
  service/env/example switch, map overlay, geocoder, and a subscription.

## Risks / unknowns (validate during implementation)

1. **URL deep-linking precedence** — persisted tab storage must never override a
   URL deep-link (see the dedicated section). Treat as a blocking acceptance
   criterion, not just a nice-to-have.
2. **Monaco-in-Vite worker setup** and **Monaco under jsdom for tests** — highest
   technical risk; the `setup-workers/vite` helper is expected to cover the build
   side.
3. Exact `GraphiQL.Toolbar` render-prop ergonomics for placing custom controls
   alongside built-in `prettify`/`copy`/`merge`.
4. Theme-based logo swap timing via `useTheme` (avoid a flash on load).
5. CSS/layout drift from CodeMirror → Monaco and the new container structure;
   reconcile `custom.css` and `darktheme.css`.

## Rollout

Single PR containing the GraphiQL 5 migration **and** the React 19 bump (they are
inseparable). Supersedes renovate PR #432. Close WIP PR #269 with a pointer to
this work.
