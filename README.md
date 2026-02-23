# Duartois — Portfolio

Personal portfolio with interactive 3D experience. Built with Next.js App Router, TypeScript, Three.js, Tailwind CSS, Framer Motion and i18n support (pt/en).

🌐 **Live:** [duartois.vercel.app](https://duartois.vercel.app)

---

## Stack

| Layer     | Technology                 |
| --------- | -------------------------- |
| Framework | Next.js 16 (App Router)    |
| Language  | TypeScript 5.4             |
| Styling   | Tailwind CSS 4             |
| 3D        | Three.js 0.160 (core only) |
| Animation | Framer Motion 12           |
| i18n      | i18next + react-i18next    |
| Tests     | Vitest 4 + Testing Library |
| Quality   | ESLint + Prettier + Husky  |
| Deploy    | Vercel                     |

---

## Getting Started

```bash
npm install
npm run dev       # http://localhost:3000
```

---

## Scripts

| Command                | Description                                     |
| ---------------------- | ----------------------------------------------- |
| `npm run dev`          | Start dev server                                |
| `npm run build`        | Production build (runs verify:three first)      |
| `npm run start`        | Serve production build                          |
| `npm run lint`         | ESLint                                          |
| `npm run type-check`   | TypeScript check (no emit)                      |
| `npm run test`         | Run Vitest once                                 |
| `npm run test:watch`   | Vitest in watch mode                            |
| `npm run coverage`     | Coverage report (text + html + lcov)            |
| `npm run analyze`      | Bundle analyzer (`ANALYZE=true`)                |
| `npm run perf:report`  | Build + generate `reports/perf-summary.md`      |
| `npm run verify:three` | Guard: no three/examples or R3F imports allowed |

---

## Project Structure

```
app/
  helpers/          # Runtime utils, events, perf debug, Three.js context
  i18n/             # i18next config and locale files
  theme/            # Theme context (light/dark)
  work/             # Project data (projects.ts, projectDetails.ts)
  helpers/runtime/  # browser.ts, math.ts — SSR-safe primitives

components/
  three/            # Three.js scene: types, sceneBundle, CoreCanvas, factories…
  Preloader.tsx     # Animated loading screen
  AnimationQualityContext.tsx

scripts/
  verify-three-core-only.ts   # CI guard: bans three/examples and R3F
  generate-perf-summary.ts    # Generates reports/perf-summary.md

public/
  files/            # Static assets (resume PDF, etc.)

reports/
  perf-summary.md   # Auto-generated performance report
```

---

## Testing

```bash
npm run test          # single run
npm run test:watch    # interactive
npm run coverage      # HTML report at coverage/
```

Tests use Vitest + jsdom + Testing Library. Setup file: `setupTests.ts`.

---

## Performance Monitoring

```bash
# Capture baseline on a clean commit
PERF_BASELINE=true npm run perf:report

# Generate comparison report after changes
npm run perf:report

# Live perf logging in dev
NEXT_PUBLIC_PERF_DEBUG=true npm run dev
```

Reports are saved to `reports/`. See [`reports/perf-summary.md`](./reports/perf-summary.md).

---

## Three.js Usage Policy

Only `three` core is allowed. The following are **banned** and enforced by `npm run verify:three`:

- `three/examples/*` and `three/addons/*`
- `three-stdlib`
- `@react-three/*` (R3F)
- `troika-three-text`, `maath`, `postprocessing`

This keeps the 3D bundle minimal and avoids R3F overhead for a custom imperative scene.

---

## Environment Variables

| Variable                 | Default | Description                                         |
| ------------------------ | ------- | --------------------------------------------------- |
| `NEXT_PUBLIC_PERF_DEBUG` | `false` | Enables console perf logging                        |
| `PERF_BASELINE`          | —       | Set to `true` to write `reports/perf-baseline.json` |
| `ANALYZE`                | —       | Set to `true` to open bundle analyzer after build   |

---

## i18n

Locales: **pt** (default) and **en**. Configured in `app/i18n/config.ts`.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
