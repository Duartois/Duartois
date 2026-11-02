# Performance Summary

Generated at: N/A (run `npm run perf:report` to regenerate)

## Initial JS by route (from build manifests)

| Route        | Before | After |
| ------------ | ------ | ----- |
| /            | N/A    | N/A   |
| /work        | N/A    | N/A   |
| /work/[slug] | N/A    | N/A   |
| /about       | N/A    | N/A   |
| /contact     | N/A    | N/A   |

## First render request/image summary

- Baseline: N/A (capture using `NEXT_PUBLIC_PERF_DEBUG=true`).
- After: N/A (capture using `NEXT_PUBLIC_PERF_DEBUG=true`).

## Key changes

- Canvas/Three boot now deferred to idle or user interaction and disabled on About/Contact.
- Preloader no longer blocks initial content; heavy asset preloading reduced.
- Brand guidelines galleries gated behind a “View brand guidelines” button with dynamic import and incremental loading.
- Added animation quality auto mode to reduce animation work on low-end devices.
- Removed global route prefetching to avoid unnecessary JS work.

## How to measure

- `npm run perf:report` to regenerate this file from build artifacts.
- `PERF_BASELINE=true npm run perf:report` to capture a baseline on a previous commit.
- `NEXT_PUBLIC_PERF_DEBUG=true npm run dev` to log FCP, 3D init timing, and image counts.

## Low-end device pass (3D scene + grain layer)

Measured on an Intel UHD 617 (MacBook Air class) with `EXT_disjoint_timer_query_webgl2`, same canvas size on both builds:

| Metric                                | Before                 | After (`low` tier)      |
| ------------------------------------- | ---------------------- | ----------------------- |
| Triangles                             | 374,080                | 40,376                  |
| Vertices                              | 1,122,240              | 21,642                  |
| Geometry memory                       | 47.1 MB                | 1.0 MB                  |
| JS heap after scene init              | 60.6 MB                | 9.8 MB                  |
| GPU time / frame @ 1024×768           | 8.3 ms                 | 2.9 ms                  |
| GPU time / frame @ 2048×1536          | 16.9 ms                | 9.4 ms                  |
| Frames rendered, About page, idle 3 s | continuous             | 0                       |
| `.noise` layer size                   | 600% × 600%            | viewport + 400px        |
| Noise texture weight                  | 107 KB (+ live filter) | 6 KB × 2 (filter baked) |

Visual parity of the 3D canvas (same viewport, same state, pixel diff against the previous build): mean difference ≤ 0.14/255; ≤ 0.21% of pixels differ by more than 4/255 (edge pixels and specular glints).

Pixel ratio on blurred pages is capped at 1× and the idle breathing is skipped there only when the browser actually applies the unprefixed `backdrop-filter` (Safari ≤ 17 shows those pages sharp, so it keeps full resolution).

## Navigation continuity

Measured against the previous build, with the router responses delayed by 1.5 s (local proxy) to mimic a slow connection or a cold serverless render:

| Moment (Work → project)      | Before                          | After                                        |
| ---------------------------- | ------------------------------- | -------------------------------------------- |
| Click                        | exit animation starts (82 ms)   | exit animation starts (82 ms)                |
| Old page visible again       | yes, at 1007 ms (until 3365 ms) | never                                        |
| New page shown               | 3365 ms (hard cut)              | 2844 ms, after the route committed           |
| RSC requests on `/work` load | 17                              | 6                                            |
| RSC requests when menu opens | +8 project routes               | 0                                            |
| Shapes drawn on `/work`      | 6 (5 at alpha 0)                | 1                                            |
| Largest 3D step at page swap | 8.5 world units in one tick     | 2.2–2.9, decaying smoothly to rest in ~1.5 s |

The canvas element, WebGL context and document are the same before and after every navigation; only the shapes' targets change.

## Full audit pass

Initial JavaScript per route (gzip, `<script>` tags of the HTML, polyfills excluded):

| Route    | Before | After  |
| -------- | ------ | ------ |
| /        | 226 KB | 202 KB |
| /work    | 232 KB | 207 KB |
| /about   | 228 KB | 203 KB |
| /contact | 222 KB | 197 KB |

Opening a project (`/work/duartois`), requests to the image CDN: 43 before (13 gallery images at 2560 px plus the Preloader's background downloads) → 2 after (hero + first visible image); the other 14 gallery images are lazy and use `sizes`.

Fall-in items at rest no longer hold a `filter` or a 3D transform, so each one stops owning an offscreen surface once its animation ends.

Not measured here: real-device frame rates (the test browser caps `requestAnimationFrame`), and the effect of `navigationPreload` (needs a deployed service worker).

Safe to remove from `package.json` when the lockfiles can be regenerated: `@reduxjs/toolkit`, `react-redux`, `locomotive-scroll` (nothing imports them any more).
