# Performance Summary

Generated at: N/A (run `npm run perf:report` to regenerate)

## Initial JS by route (from build manifests)

| Route | Before | After |
| --- | --- | --- |
| / | N/A | N/A |
| /work | N/A | N/A |
| /work/[slug] | N/A | N/A |
| /about | N/A | N/A |
| /contact | N/A | N/A |

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
