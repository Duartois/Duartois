# Duartois New Portfolio

This folder contains a ready‑to‑use **Next.js 14** project scaffolded with the
new **App Router** and a bespoke Three.js scene manager.  The look and feel is
inspired by [`itssharl.ee`](https://itssharl.ee/) yet no external geometry
files or Blender exports are required.  A single global canvas is driven by the
modules in `components/three`, exposing a small API on `window.__THREE_APP__` so
pages and widgets can switch scene variants without remounting the renderer.
All shapes are generated procedurally (e.g. `TorusGeometry`, `TubeGeometry`,
`SphereGeometry`) and animated via lightweight lerping.  A custom shader adds a
gradient fresnel rim with animated noise for the glossy “blob” aesthetic.

## Getting started

1. **Install dependencies**

   ```bash
   npm install
   ```

   The `package.json` lists the necessary packages: `react`, `next`
   and `three`.  The scene manager, materials and factories live in
   plain TypeScript modules under `components/three`.

2. **Verify core-only Three.js usage**

   ```bash
   npm run verify:three
   ```

   This guard scans the `app`, `components` and `types` directories to ensure no
   forbidden helpers such as `three/examples` or `@react-three/*` make it into
   the bundle. It also runs automatically before `npm run build`.

3. **Run the development server**

   ```bash
   npm run dev
   ```

   The site will be available at [http://localhost:3000](http://localhost:3000).
   Each page (`/`, `/about`, `/work` and `/contact`) updates the
   singleton canvas via `window.__THREE_APP__?.setState(...)`.  Hovering
   over navigation items or project previews gently scales the meshes,
   while the preloader listens for the scene’s `ready` event before
   revealing the UI.

4. **Quality checks and tests**

   Run linting, type-checking, unit tests and coverage locally before pushing:

   ```bash
   npm run lint         # Next.js ESLint rules
   npm run type-check   # Strict TypeScript project check
   npm run test         # Vitest in single-run mode
   npm run test:watch   # Vitest watch mode for local development
   npm run coverage     # Collect coverage reports (text, lcov, html)
   ```

   The test setup uses Vitest with Testing Library (`@testing-library/react`
   and `@testing-library/jest-dom`).  Common helpers are initialised in
   `setupTests.ts` which runs automatically before each test file.

5. **Bundle analysis**

   To inspect bundle size locally, enable the analyzer during a build:

   ```bash
   npm run analyze
   ```

   This wraps `next build` with `@next/bundle-analyzer`, generating an
   interactive treemap to help spot large dependencies.

6. **Editing shapes**

   The factories in `components/three/factories.ts` create the
   geometries and gradient materials.  Adjust the torus radii, the
   Catmull–Rom control points or the shader uniforms to explore new
   looks.  Variant transforms are defined in `components/three/types.ts`.

7. **Changing the material**

   The gradient shader is defined inline in `components/three/factories.ts`.
   It exposes colour stops plus animated amplitude/frequency uniforms.
   You can tweak them or swap the shader for any other `THREE.Material`.

8. **Extending the project**

   The singleton canvas avoids layout thrashing: it mounts once in
   `CanvasRoot` and reacts to state changes.  Use
   `window.__THREE_APP__?.setState` to orchestrate transitions from
   any page, preloader or widget.
