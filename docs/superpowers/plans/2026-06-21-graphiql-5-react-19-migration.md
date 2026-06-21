# GraphiQL 5 + React 19 Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the app off the legacy `graphiql@1.x` monolith to modular GraphiQL 5.x and land React 19 in the same change, preserving all Entur features and URL deep-linking.

**Architecture:** A single `<GraphiQL>` (v5, Monaco editor) rendered under a custom Entur header bar. Entur-only controls (service / environment / examples / map / geocoder / theme) live in `AppToolbar` using a ported `CustomDropdown`; GraphiQL built-ins cover prettify / copy / merge / history / explorer / theming. Query, variables and operationName are seeded from the URL and synced back on every edit; GraphiQL is given non-persistent in-memory storage so a URL deep-link always wins over previous session state.

**Tech Stack:** React 19, GraphiQL 5 (`graphiql`, `@graphiql/react`, `@graphiql/plugin-explorer`), Monaco (via `graphiql/setup-workers/vite`), Vite 8, Vitest, graphql-ws.

**Spec:** `docs/superpowers/specs/2026-06-21-graphiql-5-migration-design.md`

**Branch:** `feat/graphiql-5-react-19` (already created; the spec is committed here).

---

## File Structure

| File | Responsibility | Action |
|---|---|---|
| `package.json` | dependency versions | Modify |
| `src/index.tsx` | app entry; Monaco worker setup | Modify |
| `src/utils/inMemoryStorage.ts` | non-persistent Storage so URL wins over saved tab state | Create |
| `src/components/App/CustomDropdown.tsx` (+ `.module.css`) | menu replacement for removed `GraphiQL.Menu` | Create (port from #269) |
| `src/components/App/MapPortal.tsx` (+ `.module.css`) | map overlay container | Create (port + adapt from #269) |
| `src/components/App/AppToolbar.tsx` (+ `.module.css`) | Entur header bar (logo + dropdowns + buttons) | Create |
| `src/components/App/App.tsx` | main component; GraphiQL 5 wiring + URL state | Modify (rewrite render + remove imperative API) |
| `src/components/App/App.test.tsx` | unit tests incl. deep-link wiring | Modify |
| `src/components/App/DarkmodeExplorerColors.ts` | old explorer dark colors | Delete |
| `src/components/App/custom.css`, `src/darktheme.css` | reconcile to v5/Monaco | Modify |

**Removed dependencies/imports:** `graphiql-explorer`, `import GraphiQL from 'graphiql'` (default), `graphiql/graphiql.css`, `DarkmodeExplorerColors`, the `.execute-button` SVG `useEffect`, and the imperative `graphiql.current.*` handlers.

---

## Task 1: Port `CustomDropdown` (standalone, keeps app green)

**Files:**
- Create: `src/components/App/CustomDropdown.tsx`
- Create: `src/components/App/CustomDropdown.module.css`
- Test: `src/components/App/CustomDropdown.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/App/CustomDropdown.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import CustomDropdown from './CustomDropdown';

test('opens on click and fires onChange with the selected value', () => {
  const onChange = vi.fn();
  render(
    <CustomDropdown
      label="Service"
      selected="a"
      onChange={onChange}
      options={[
        { value: 'a', label: 'Alpha' },
        { value: 'b', label: 'Beta' },
      ]}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: /Service/ }));
  fireEvent.click(screen.getByRole('option', { name: /Beta/ }));
  expect(onChange).toHaveBeenCalledWith('b');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/components/App/CustomDropdown.test.tsx`
Expected: FAIL — `Cannot find module './CustomDropdown'`.

- [ ] **Step 3: Create the component** (ported verbatim from PR #269)

```tsx
// src/components/App/CustomDropdown.tsx
import React, { useState, useRef, useEffect } from 'react';
import styles from './CustomDropdown.module.css';

export interface DropdownOption {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  selected: string;
  onChange: (value: string) => void;
  label: string;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  options,
  selected,
  onChange,
  label,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className={styles.dropdown} ref={ref}>
      <button
        className={styles.button}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        type="button"
      >
        {label}
        <svg width="14" height="8">
          <path fill="#666" d="M 5 1.5 L 14 1.5 L 9.5 7 z"></path>
        </svg>
      </button>
      {open && (
        <ul className={styles.menu} role="listbox">
          {options.map((option) => (
            <li
              key={option.value}
              className={
                styles.option +
                (option.value === selected ? ' ' + styles.selected : '')
              }
              role="option"
              aria-selected={option.value === selected}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              {option.value === selected && (
                <span className={styles.check}>✓</span>
              )}
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomDropdown;
```

Create `src/components/App/CustomDropdown.module.css` with the styles from PR #269 (`.dropdown`, `.button`, `.menu`, `.option`, `.option:hover`, `.check`) — copy them verbatim from `git show pr269:src/components/App/CustomDropdown.module.css`. Add a `.selected { font-weight: 600; }` rule (the class is referenced but was absent in #269).

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- src/components/App/CustomDropdown.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/App/CustomDropdown.tsx src/components/App/CustomDropdown.module.css src/components/App/CustomDropdown.test.tsx
git commit -m "feat(app): add CustomDropdown (replaces removed GraphiQL.Menu)"
```

---

## Task 2: Port + adapt `MapPortal` (React-19-safe, app-owned target)

**Files:**
- Create: `src/components/App/MapPortal.tsx`
- Create: `src/components/App/MapPortal.module.css`
- Test: `src/components/App/MapPortal.test.tsx`

PR #269's MapPortal used `import ReactDOM from 'react-dom'` and portaled into GraphiQL's internal `#graphiql-session`. Adapt: use the named `createPortal` (React 19 removed parts of the `react-dom` default export) and portal into an app-owned `#map-portal-root` element so we don't depend on GraphiQL internals.

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/App/MapPortal.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import MapPortal from './MapPortal';

test('renders into #map-portal-root when show=true and closes', () => {
  const host = document.createElement('div');
  host.id = 'map-portal-root';
  document.body.appendChild(host);
  const onClose = vi.fn();

  render(
    <MapPortal show onClose={onClose}>
      <div>MAP</div>
    </MapPortal>
  );
  expect(screen.getByText('MAP')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /Close map/ }));
  expect(onClose).toHaveBeenCalled();
});

test('renders nothing when show=false', () => {
  const host = document.createElement('div');
  host.id = 'map-portal-root';
  document.body.appendChild(host);
  render(
    <MapPortal show={false} onClose={() => {}}>
      <div>MAP</div>
    </MapPortal>
  );
  expect(screen.queryByText('MAP')).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/components/App/MapPortal.test.tsx`
Expected: FAIL — `Cannot find module './MapPortal'`.

- [ ] **Step 3: Create the component**

```tsx
// src/components/App/MapPortal.tsx
import React from 'react';
import { createPortal } from 'react-dom';
import styles from './MapPortal.module.css';

interface MapPortalProps {
  show: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const MapPortal: React.FC<MapPortalProps> = ({ show, onClose, children }) => {
  if (typeof document === 'undefined') return null;
  const host = document.getElementById('map-portal-root');
  if (!show || !host) return null;
  return createPortal(
    <div className={styles['map-portal-container']}>
      <button
        onClick={onClose}
        className={styles['map-portal-close']}
        aria-label="Close map"
        title="Close map"
      >
        ×
      </button>
      <div className={styles['map-portal-content']}>{children}</div>
    </div>,
    host
  );
};

export default MapPortal;
```

Create `src/components/App/MapPortal.module.css` with the styles from PR #269 (`.map-portal-container`, `.map-portal-close`, `.map-portal-content`) — copy verbatim from `git show pr269:src/components/App/MapPortal.module.css`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- src/components/App/MapPortal.test.tsx`
Expected: PASS (both tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/App/MapPortal.tsx src/components/App/MapPortal.module.css src/components/App/MapPortal.test.tsx
git commit -m "feat(app): add MapPortal overlay (React 19 createPortal, app-owned target)"
```

---

## Task 3: Add non-persistent in-memory storage util

GraphiQL persists tab/query state in `localStorage`; `initialQuery` only applies when no persisted state exists. To guarantee a URL deep-link always wins (spec hard requirement), give GraphiQL an in-memory `Storage` so it never persists query/tab state across reloads. The URL is the app's persistence layer.

**Files:**
- Create: `src/utils/inMemoryStorage.ts`
- Test: `src/utils/inMemoryStorage.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/utils/inMemoryStorage.test.ts
import { expect, test } from 'vitest';
import { createInMemoryStorage } from './inMemoryStorage';

test('implements the Storage interface without touching localStorage', () => {
  const s = createInMemoryStorage();
  expect(s.getItem('x')).toBeNull();
  s.setItem('x', '1');
  expect(s.getItem('x')).toBe('1');
  expect(s.length).toBe(1);
  s.removeItem('x');
  expect(s.getItem('x')).toBeNull();
  s.setItem('a', '1');
  s.clear();
  expect(s.length).toBe(0);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/utils/inMemoryStorage.test.ts`
Expected: FAIL — `Cannot find module './inMemoryStorage'`.

- [ ] **Step 3: Create the util**

```ts
// src/utils/inMemoryStorage.ts
// A Storage implementation that never persists. Used for GraphiQL so a URL
// deep-link (query/variables/operationName) is always authoritative and is never
// overridden by a previous session's saved editor state.
export function createInMemoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear() {
      map.clear();
    },
    getItem(key: string) {
      return map.has(key) ? (map.get(key) as string) : null;
    },
    key(index: number) {
      return Array.from(map.keys())[index] ?? null;
    },
    removeItem(key: string) {
      map.delete(key);
    },
    setItem(key: string, value: string) {
      map.set(key, String(value));
    },
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- src/utils/inMemoryStorage.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/utils/inMemoryStorage.ts src/utils/inMemoryStorage.test.ts
git commit -m "feat(app): add in-memory storage so URL deep-links win over saved state"
```

---

## Task 4: Bump dependencies + Monaco worker setup + CSS

This task changes deps and entry wiring. The app will **not** compile until Task 6 finishes the `App.tsx` rewrite — that is expected; this task and Tasks 5–6 form one logical unit and are committed in sequence.

**Files:**
- Modify: `package.json`
- Modify: `src/index.tsx`

- [ ] **Step 1: Edit `package.json`**

Apply these exact version changes (match renovate PR #432 for the React set):

```
"graphiql": "5.2.4",            // was 1.11.5
"react": "19.2.7",             // was 18.3.1
"react-dom": "19.2.7",         // was 18.3.1
"react-test-renderer": "19.2.7", // was 18.3.1
"eslint-plugin-react-hooks": "7.1.1", // was 5.2.0 (devDependencies)
```

Remove the `graphiql-explorer` dependency line entirely. Leave `@graphiql/react`, `@graphiql/plugin-explorer`, `@graphiql/toolkit`, `@types/react`, `@types/react-dom` as-is (already v5/19-era).

- [ ] **Step 2: Install**

Run: `npm install`
Expected: exits 0; `graphiql@5.2.4` and `react@19.2.7` resolved; `graphiql-explorer` gone. (`npm ls graphiql react` to confirm.)

- [ ] **Step 3: Add Monaco worker setup + swap CSS in `src/index.tsx`**

Add at the very top of `src/index.tsx`, before other imports:

```tsx
// GraphiQL 5 uses the Monaco editor; this registers its web workers for Vite.
import 'graphiql/setup-workers/vite';
```

(There are no CSS imports in `index.tsx` today — the GraphiQL CSS swap happens in `App.tsx`, Task 6. This step only adds the worker setup import.)

- [ ] **Step 4: Verify worker module resolves**

Run: `node -e "require('fs').accessSync('node_modules/graphiql/dist/setup-workers/vite.js')"`
Expected: no output, exit 0 (the Vite worker helper exists).

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json src/index.tsx
git commit -m "build: bump to graphiql 5 + react 19, drop graphiql-explorer, add Monaco workers"
```

---

## Task 5: Build the Entur header bar (`AppToolbar`)

Encapsulates all Entur-specific controls so `App.tsx` stays focused. Uses `CustomDropdown` for menus and plain buttons for toggles.

**Files:**
- Create: `src/components/App/AppToolbar.tsx`
- Create: `src/components/App/AppToolbar.module.css`
- Test: `src/components/App/AppToolbar.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/App/AppToolbar.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import AppToolbar from './AppToolbar';

const services = [
  { id: 'journey-planner-v3', name: 'JourneyPlanner' },
  { id: 'mobility-v2', name: 'Mobility' },
];

test('renders controls and fires callbacks', () => {
  const onServiceChange = vi.fn();
  const onToggleMap = vi.fn();
  render(
    <AppToolbar
      logoSrc="logo.png"
      services={services}
      currentServiceId="journey-planner-v3"
      onServiceChange={onServiceChange}
      onEnvironmentChange={vi.fn()}
      exampleKeys={['trip', 'nearest']}
      onExampleSelect={vi.fn()}
      onToggleMap={onToggleMap}
      onSearchForId={vi.fn()}
      currentTheme="light"
      onThemeChange={vi.fn()}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: /Map/ }));
  expect(onToggleMap).toHaveBeenCalled();

  fireEvent.click(screen.getByRole('button', { name: /Service/ }));
  fireEvent.click(screen.getByRole('option', { name: /Mobility/ }));
  expect(onServiceChange).toHaveBeenCalledWith('mobility-v2');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/components/App/AppToolbar.test.tsx`
Expected: FAIL — `Cannot find module './AppToolbar'`.

- [ ] **Step 3: Create `AppToolbar.tsx`**

```tsx
// src/components/App/AppToolbar.tsx
import React from 'react';
import CustomDropdown from './CustomDropdown';
import styles from './AppToolbar.module.css';

interface ServiceOption {
  id: string;
  name: string;
}

interface AppToolbarProps {
  logoSrc: string;
  services: ServiceOption[];
  currentServiceId: string;
  onServiceChange: (id: string) => void;
  onEnvironmentChange: (env: string) => void;
  exampleKeys: string[];
  onExampleSelect: (key: string) => void;
  onToggleMap: () => void;
  onSearchForId: () => void;
  currentTheme: string;
  onThemeChange: (theme: string) => void;
}

const AppToolbar: React.FC<AppToolbarProps> = ({
  logoSrc,
  services,
  currentServiceId,
  onServiceChange,
  onEnvironmentChange,
  exampleKeys,
  onExampleSelect,
  onToggleMap,
  onSearchForId,
  currentTheme,
  onThemeChange,
}) => {
  return (
    <div className={styles.toolbar}>
      <img alt="logo" src={logoSrc} className={styles.logo} />

      <CustomDropdown
        label="Service"
        selected={currentServiceId}
        onChange={onServiceChange}
        options={services.map((s) => ({ value: s.id, label: s.name }))}
      />

      <CustomDropdown
        label="Environment"
        selected=""
        onChange={onEnvironmentChange}
        options={[
          { value: 'prod', label: 'Prod' },
          { value: 'staging', label: 'Staging' },
          { value: 'dev', label: 'Dev' },
        ]}
      />

      {exampleKeys.length > 0 && (
        <CustomDropdown
          label="Examples"
          selected=""
          onChange={onExampleSelect}
          options={exampleKeys.map((k) => ({ value: k, label: k }))}
        />
      )}

      <CustomDropdown
        label="Theme"
        selected={currentTheme}
        onChange={onThemeChange}
        options={[
          { value: 'light', label: 'Light' },
          { value: 'dark', label: 'Dark' },
        ]}
      />

      <button type="button" className={styles.button} onClick={onToggleMap}>
        Map
      </button>
      <button type="button" className={styles.button} onClick={onSearchForId}>
        Search for ID
      </button>
    </div>
  );
};

export default AppToolbar;
```

```css
/* src/components/App/AppToolbar.module.css */
.toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-bottom: 1px solid var(--graphiql-popover-border, #ccc);
  flex-wrap: wrap;
}
.logo {
  height: 28px;
  margin-right: 8px;
}
.button {
  padding: 6px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
  background-color: #f8f8f8;
  cursor: pointer;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- src/components/App/AppToolbar.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/App/AppToolbar.tsx src/components/App/AppToolbar.module.css src/components/App/AppToolbar.test.tsx
git commit -m "feat(app): add Entur AppToolbar (service/env/examples/theme/map/geocoder)"
```

---

## Task 6: Rewrite `App.tsx` for GraphiQL 5

Replace the GraphiQL 1.x integration with v5. Keep all non-GraphiQL logic (config, routing/`ConnectedApp`, example loading, subscription detection, fetcher). Remove the imperative `graphiql.current.*` handlers, the compound `GraphiQL.*` toolbar, `graphiql-explorer`, `DarkmodeExplorerColors`, and the `.execute-button` SVG effect.

**Files:**
- Modify: `src/components/App/App.tsx`
- Delete: `src/components/App/DarkmodeExplorerColors.ts`

- [ ] **Step 1: Replace the imports block** (lines 1–42)

```tsx
import React, {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { GraphiQL } from 'graphiql';
import { explorerPlugin } from '@graphiql/plugin-explorer';
import {
  buildClientSchema,
  getIntrospectionQuery,
  GraphQLSchema,
  parse,
} from 'graphql';
import queryString from 'query-string';
import graphQLFetcher from '../../utils/graphQLFetcher';
import getPreferredTheme from '../../utils/getPreferredTheme';
import { createInMemoryStorage } from '../../utils/inMemoryStorage';
import history from '../../utils/history';
const GeocoderModal = lazy(() => import('../GeocoderModal'));
import './custom.css';
import findServiceName from '../../utils/findServiceName';

import 'graphiql/style.css';
import '@graphiql/plugin-explorer/style.css';

import MapView from '../MapView';
import MapPortal from './MapPortal';
import AppToolbar from './AppToolbar';

import whiteLogo from '../../static/images/entur-white.png';
import normalLogo from '../../static/images/entur.png';

import { NotFound } from './404';

import {
  ConfigContext,
  useConfig,
  useFetchConfig,
} from '../../config/ConfigContext';
```

- [ ] **Step 2: Inside `App`, add v5 wiring and remove imperative state**

After the existing `const serviceName = ...` line, add:

```tsx
  const explorer = useMemo(() => explorerPlugin(), []);
  const graphiqlStorage = useMemo(() => createInMemoryStorage(), []);
  const [queryInitialized, setQueryInitialized] = useState(false);
```

Delete these now-unused pieces:
- `let graphiql = useRef<any>(null);`
- `handleClickPrettifyButton`, `handleClickMinifyButton`, `handleHistoryButton`, `toggleExplorer`, `showExplorer`/`setShowExplorer`, `renderExamplesMenu`.
- the `print` / `stripIgnoredCharacters` imports (already removed in Step 1) and the `.execute-button` SVG `useEffect` (the whole `useEffect` that queries `.graphiql-container .execute-button`).
- `import explorerDarkColors from './DarkmodeExplorerColors';` (removed in Step 1).

In the `setInitialQuery` effect, set `setQueryInitialized(true)` immediately before each `hasInitializedQuery.current = true;` assignment (and in the final `else if` branch), so GraphiQL mounts only once the initial query has resolved.

- [ ] **Step 3: Replace the `return (...)` render block** (everything from `return (` after the `if (currentService == null)` guard)

```tsx
  const exampleKeys = Object.keys(exampleQueries || {});

  if (currentService == null) {
    return <NotFound />;
  }

  return (
    <div className="App">
      <AppToolbar
        logoSrc={currentTheme === 'dark' ? whiteLogo : normalLogo}
        services={services}
        currentServiceId={currentService.id}
        onServiceChange={handleServiceChange}
        onEnvironmentChange={handleEnvironmentChange}
        exampleKeys={exampleKeys}
        onExampleSelect={handleExampleSelect}
        onToggleMap={toggleMap}
        onSearchForId={searchForId}
        currentTheme={currentTheme}
        onThemeChange={handleThemeChange}
      />
      <div className="graphiql-wrapper">
        {queryInitialized ? (
          <GraphiQL
            fetcher={customFetcher}
            schema={schema}
            plugins={[explorer]}
            storage={graphiqlStorage}
            forcedTheme={currentTheme === 'dark' ? 'dark' : 'light'}
            initialQuery={query}
            initialVariables={variables}
            operationName={operationName}
            onEditQuery={(value) => editParameter('query', value)}
            onEditVariables={(value) => editParameter('variables', value)}
            onEditOperationName={(value) =>
              editParameter('operationName', value)
            }
          >
            <GraphiQL.Logo>
              <img
                alt="logo"
                src={currentTheme === 'dark' ? whiteLogo : normalLogo}
                className="logo"
              />
            </GraphiQL.Logo>
            <GraphiQL.Footer>
              <div className="label">
                {currentService.name}:{' '}
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={currentService.url}
                >
                  {currentService.url}
                </a>
              </div>
            </GraphiQL.Footer>
          </GraphiQL>
        ) : (
          <div className="graphiql-loading">Loading…</div>
        )}
        <div id="map-portal-root" />
      </div>
      {showGeocoderModal ? (
        <Suspense fallback={<div>Loading...</div>}>
          <GeocoderModal onDismiss={() => setShowGeocoderModal(false)} />
        </Suspense>
      ) : null}
      <MapPortal show={showMap} onClose={() => setShowMap(false)}>
        {response ? (
          <MapView response={response} />
        ) : (
          <p>
            No map data available. Run a query that returns geographic data to
            see the map.
          </p>
        )}
      </MapPortal>
    </div>
  );
```

Notes:
- `variables` and `operationName` already come from `const { variables, operationName } = parameters;` — keep that line.
- `customFetcher`, `fetcher`, `schema`, the `setInitialQuery` effect, `editParameter`, `handleServiceChange`, `handleEnvironmentChange`, `handleThemeChange`, `handleExampleSelect`, `toggleMap`, `searchForId`, `exampleQueries` loading, and `isSubscriptionQuery` are all unchanged.
- The `currentTheme` `useEffect` that toggled `body.dark-theme` can stay (harmless) or be removed; prefer removing the `body.dark-theme` toggle since GraphiQL now owns theming via `forcedTheme`. Keep the `import('../../darktheme.css')` line only if `darktheme.css` still styles app chrome (see Task 8).

- [ ] **Step 4: Delete the dead file**

```bash
git rm src/components/App/DarkmodeExplorerColors.ts
```

- [ ] **Step 5: Typecheck the file**

Run: `npx tsc --noEmit -p tsconfig.json 2>&1 | grep -i 'App.tsx' || echo "App.tsx clean"`
Expected: `App.tsx clean` (no new App.tsx type errors; pre-existing unrelated errors elsewhere are out of scope — see spec).

- [ ] **Step 6: Build**

Run: `npm run build`
Expected: exits 0, `✓ built`. If Monaco worker errors appear, confirm `import 'graphiql/setup-workers/vite'` is the first import in `src/index.tsx`.

- [ ] **Step 7: Commit**

```bash
git add src/components/App/App.tsx
git rm src/components/App/DarkmodeExplorerColors.ts
git commit -m "feat(app): migrate App to GraphiQL 5 (Monaco, plugins, URL-seeded state)"
```

---

## Task 7: Update tests (incl. deep-link wiring) and make green

**Files:**
- Modify: `src/components/App/App.test.tsx`

The current test mocks `graphiql` (default export) and `graphiql-explorer`. Update mocks to the v5 named export and the explorer plugin, and add a deep-link assertion that the URL `query` reaches GraphiQL's `initialQuery` and edits call `setParameters`/URL sync.

- [ ] **Step 1: Replace the mocks block**

```tsx
// at top of src/components/App/App.test.tsx, replace the graphiql/graphiql-explorer mocks
vi.mock('graphiql', () => ({
  GraphiQL: Object.assign(
    (props: any) => (
      <div data-testid="graphiql" data-initial-query={props.initialQuery}>
        GraphiQL Mock
      </div>
    ),
    {
      Logo: ({ children }: any) => <div>{children}</div>,
      Toolbar: ({ children }: any) => <div>{children}</div>,
      Footer: ({ children }: any) => <div>{children}</div>,
    }
  ),
}));

vi.mock('@graphiql/plugin-explorer', () => ({
  explorerPlugin: () => ({}),
}));

vi.mock('graphiql/style.css', () => ({}));
vi.mock('@graphiql/plugin-explorer/style.css', () => ({}));
vi.mock('graphiql/setup-workers/vite', () => ({}));
```

Remove the old `vi.mock('graphiql', ...)` default-export mock and the `vi.mock('graphiql-explorer', ...)` block. Keep the `graphql` and `graphQLFetcher` mocks, but extend the `graphql` mock to also export `parse` (used by `isSubscriptionQuery`):

```tsx
vi.mock('graphql', () => ({
  buildClientSchema: vi.fn(() => ({})),
  getIntrospectionQuery: vi.fn(() => 'mock query'),
  parse: vi.fn(() => ({ definitions: [] })),
}));
```

- [ ] **Step 2: Add the deep-link test**

```tsx
test('seeds GraphiQL initialQuery from the URL query parameter', async () => {
  const { findByTestId } = render(
    <ConfigContext.Provider value={mockConfig}>
      <App
        pathname="/journey-planner-v3"
        parameters={{ query: 'query Deep { foo }' }}
        setParameters={vi.fn()}
      />
    </ConfigContext.Provider>
  );
  const node = await findByTestId('graphiql');
  expect(node.getAttribute('data-initial-query')).toBe('query Deep { foo }');
});
```

- [ ] **Step 3: Run the App tests**

Run: `npm run test:run -- src/components/App/App.test.tsx`
Expected: PASS — the existing two tests plus the new deep-link test. (GraphiQL only renders once `queryInitialized` is true; `findByTestId` awaits that.)

- [ ] **Step 4: Run the full suite**

Run: `npm run test:run`
Expected: all tests pass (the original 9 + the new CustomDropdown/MapPortal/inMemoryStorage/AppToolbar/deep-link tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/App/App.test.tsx
git commit -m "test(app): update App tests for GraphiQL 5 + deep-link wiring"
```

---

## Task 8: Reconcile CSS (Monaco / theme) and remove dead styles

**Files:**
- Modify: `src/components/App/custom.css`
- Modify: `src/darktheme.css`

- [ ] **Step 1: Audit old CodeMirror/explorer selectors**

Run: `grep -nE 'CodeMirror|graphiql-explorer|execute-button|\.cm-' src/components/App/custom.css src/darktheme.css`
Expected: a list of selectors targeting CodeMirror / the old explorer / the execute button.

- [ ] **Step 2: Remove dead rules**

Delete rules that target `.CodeMirror*`, `.graphiql-explorer*`, and `.execute-button svg` overrides (these elements no longer exist under Monaco/plugin-explorer). Keep app-chrome rules (`.App`, `.graphiql-wrapper`, `.logo`, `.label`, footer). Add:

```css
/* src/components/App/custom.css */
.graphiql-wrapper {
  flex: 1;
  min-height: 0;
  position: relative;
  display: flex;
}
.graphiql-wrapper .graphiql-container {
  flex: 1;
  min-width: 0;
}
.graphiql-loading {
  padding: 24px;
}
.App {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
```

- [ ] **Step 3: Verify build + visual sanity**

Run: `npm run build`
Expected: exits 0. (Visual verification happens in Task 9.)

- [ ] **Step 4: Commit**

```bash
git add src/components/App/custom.css src/darktheme.css
git commit -m "style(app): drop dead CodeMirror/explorer CSS, fix v5 layout"
```

---

## Task 9: Manual smoke test (the acceptance gate)

No code; this is the verification the automated tests can't cover (Monaco in a real browser, deep-link precedence, subscriptions). Use the `verify` or `run` skill to launch the app.

- [ ] **Step 1: Start dev server**

Run: `npm run dev` (port 3000).

- [ ] **Step 2: Editor + core** — confirm the Monaco editor loads (no `ReactCurrentOwner` console error), run the default query, see a response, toggle the built-in **Explorer** and **History** plugins, and run **Prettify** from the GraphiQL toolbar.

- [ ] **Step 3: Entur controls** — Service switch, Environment switch (non-localhost behavior is a no-op locally — expected), Examples selection (URL becomes `?example=…`), **Map** overlay opens and renders for a geo query, **Search for ID** opens the geocoder, **Theme** Light/Dark swaps GraphiQL theme and the logo.

- [ ] **Step 4: Deep-link acceptance (HARD requirement)** —
  1. Build a URL with explicit `query` and `variables`, open it in a **fresh** browser profile (clean storage) → editors show exactly those contents.
  2. Edit the query → URL updates; copy the URL, open in a **returning** browser (populated storage) → still shows the URL's contents, not the previous session's. (This is what `createInMemoryStorage` guarantees.)

- [ ] **Step 5: Subscription** — run a subscription query (a service with `subscriptionsUrl`); confirm streaming responses update the map/response, and the run button shows a stop affordance while active.

- [ ] **Step 6: Record results** in the PR description (what was verified, any follow-ups). If any step fails, return to systematic debugging before proceeding.

---

## Task 10: Lint, final verification, open PR

- [ ] **Step 1: Format + lint the new/changed files**

Run: `npm run format && npm run lint`
Expected: the files this plan created/modified pass. (Pre-existing lint failures on untouched files — see spec — are out of scope; do not mass-reformat unrelated files.)

- [ ] **Step 2: Full test + build**

Run: `npm run test:run && npm run build`
Expected: tests pass; build exits 0.

- [ ] **Step 3: Push and open the PR**

```bash
git push -u origin feat/graphiql-5-react-19
gh pr create --title "feat: migrate to GraphiQL 5 + React 19" --body "<summary + manual smoke results; supersedes #432; closes #269>"
```

- [ ] **Step 4: Confirm CI green** (`gh pr checks`), then request review.

---

## Self-Review notes

- **Spec coverage:** root cause (context only), dep bump + React 19 (T4), Monaco/Vite (T4), CSS swap (T1/T6/T8), explorer plugin (T6), built-in prettify/history/theme (T6, T9), removed graphiql-explorer/DarkmodeExplorerColors/SVG-hack (T6), CustomDropdown (T1), MapPortal (T2), AppToolbar/menus (T5), footer/logo (T6), **URL deep-linking incl. operationName + storage-precedence hazard** (T3 storage + T6 wiring + T7 test + T9 acceptance), tests (T7), risks→smoke (T9). All spec sections map to a task.
- **Open implementation-time validations** (flagged, not placeholders): exact GraphiQL 5 theme prop is `forcedTheme` (verified in `GraphiQLInterfaceProps`); if `forcedTheme` proves too rigid, switch to `defaultTheme` + omit. The Monaco-in-jsdom path is sidestepped by mocking `graphiql` in tests (T7), so no worker runs under Vitest.
