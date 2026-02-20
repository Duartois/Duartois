# Tools & Architecture Reference

Documentation for every tool, script and convention used in this repository.

---

## Framework — Next.js 14 (App Router)

File-based routing with React Server Components. All pages live under `app/`.

- Route group: `app/(pages)/` for layout-sharing without affecting the URL
- Server components by default; add `"use client"` only where state or browser APIs are needed
- Image optimization via `next/image` with AVIF → WebP → original fallback
- Config: [`next.config.js`](../next.config.js)

---

## Language — TypeScript 5.4

Strict mode enabled. Path aliases configured in both `tsconfig.json` and `vitest.config.ts`:

| Alias | Resolves to |
|---|---|
| `@/*` | `./*` (repo root) |
| `@/components/*` | `./components/*` |
| `@/materials/*` | `./materials/*` |
| `@/store/*` | `./store/*` |

Run `npm run type-check` for a type-only build (no output files).

---

## Styling — Tailwind CSS 4

PostCSS-based. Config via `@tailwindcss/postcss`. No `tailwind.config.*` file needed in v4.

---

## 3D — Three.js 0.160 (core only)

Custom imperative WebGL scene — no React Three Fiber.

**Architecture:**

| File | Purpose |
|---|---|
| `components/three/types.ts` | All types, variant definitions, palettes, state shape |
| `components/three/sceneBundle.ts` | Scene init, render loop, state machine |
| `components/three/CoreCanvas.tsx` | React wrapper — mounts canvas, defers scene init |
| `components/three/factories.ts` | Camera and geometry factory functions |
| `components/three/materialOpacity.ts` | Opacity updates across all meshes |
| `components/three/pointerDriver.ts` | Pointer tracking and parallax input |
| `components/three/debug-helpers.ts` | `window.__THREE_APP__` dev handle |

**Policy:** only `import … from "three"` is allowed. `three/examples`, `three/addons`, R3F and other add-ons are banned. Enforced by `npm run verify:three` (runs automatically before every build).

---

## Animation — Framer Motion 12

Used for page transitions, the Preloader animation, and stagger effects. Respects `prefers-reduced-motion` via `useReducedMotion()`.

`AnimationQualityContext` auto-detects device capability and can set quality to `"low"` to skip heavy animations.

---

## Internationalisation — i18next + react-i18next

Locales: **pt** (default) and **en**. Config: `app/i18n/config.ts`.

Namespaces are loaded per-page. The `useTranslation` hook is used in client components; server components read locale files directly.

---

## Testing — Vitest 4 + Testing Library

| File | Purpose |
|---|---|
| `vitest.config.ts` | Test environment (jsdom), path aliases, coverage config |
| `setupTests.ts` | Global setup — imports `@testing-library/jest-dom` and calls `cleanup()` after each test |

```bash
npm run test          # single run
npm run test:watch    # interactive watch
npm run coverage      # HTML report at coverage/index.html
```

Coverage reporters: `text` (stdout), `lcov` (CI), `html` (browser).

---

## Scripts

### `scripts/verify-three-core-only.ts`

Scans `app/`, `components/` and `types/` for banned Three.js imports using the TypeScript AST. Exits with code 1 if any violation is found.

```bash
npm run verify:three
```

Runs automatically via `prebuild`.

---

### `scripts/generate-perf-summary.ts`

Reads `.next/build-manifest.json` and `.next/app-build-manifest.json` to calculate initial JS bytes per route. Outputs:

- `reports/bundle-summary.json` — raw data
- `reports/perf-summary.md` — human-readable before/after table

```bash
npm run perf:report
PERF_BASELINE=true npm run perf:report   # capture baseline
NEXT_PUBLIC_PERF_DEBUG=true npm run dev  # live perf logging
```

---

## Runtime Helpers (`app/helpers/runtime/`)

SSR-safe primitives shared across the app.

| Export | Description |
|---|---|
| `isBrowser` | `true` only in a real browser |
| `getWindow()` | `window` or `null` during SSR |
| `clamp(v, min, max)` | Numeric clamp |
| `lerp(a, b, t)` | Linear interpolation |
| `mapRange(v, inMin, inMax, outMin, outMax)` | Range remapping |

---

## App Events (`app/helpers/appEvents.ts`)

Typed `CustomEvent` names for cross-component coordination without prop-drilling.

| Constant | Fired when |
|---|---|
| `APP_SHELL_REVEAL_EVENT` | Shell becomes visible after preload |
| `APP_MENU_OPEN_EVENT` | Navigation menu opens |
| `APP_MENU_CLOSE_EVENT` | Navigation menu closes |
| `APP_NAVIGATION_START_EVENT` | Route transition begins |
| `APP_NAVIGATION_END_EVENT` | Route transition completes |

---

## Perf Debug (`app/helpers/perfDebug.ts`)

Enabled with `NEXT_PUBLIC_PERF_DEBUG=true`. Logs to console under `[perf]` prefix.

Used in `CoreCanvas` to measure 3D scene initialisation time via `performance.mark`.

---

## Bundle Analyzer

```bash
npm run analyze   # opens webpack-bundle-analyzer after build
```

Powered by `@next/bundle-analyzer`. Configured in `next.config.js` via the `ANALYZE` env var.

---

## Image Optimization

Configured in `next.config.js`:

- **Formats:** AVIF → WebP → original
- **Cache TTL:** 7 days
- **Allowed hostnames:** `ap-south-1.graphassets.com`, `eu-central-1.graphassets.com`
- **Device sizes:** 640, 828, 1080, 1200, 1440, 1920, 2560
