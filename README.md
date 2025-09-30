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

2. **Run the development server**

   ```bash
   npm run dev
   ```

   The site will be available at [http://localhost:3000](http://localhost:3000).
   Each page (`/`, `/about`, `/work` and `/contact`) updates the
   singleton canvas via `window.__THREE_APP__?.setState(...)`.  Hovering
   over navigation items or project previews gently scales the meshes,
   while the preloader listens for the scene’s `ready` event before
   revealing the UI.

3. **Editing shapes**

   The factories in `components/three/factories.ts` create the
   geometries and gradient materials.  Adjust the torus radii, the
   Catmull–Rom control points or the shader uniforms to explore new
   looks.  Variant transforms are defined in `components/three/types.ts`.

4. **Changing the material**

   The gradient shader is defined inline in `components/three/factories.ts`.
   It exposes colour stops plus animated amplitude/frequency uniforms.
   You can tweak them or swap the shader for any other `THREE.Material`.

5. **Extending the project**

   The singleton canvas avoids layout thrashing: it mounts once in
   `CanvasRoot` and reacts to state changes.  Use
   `window.__THREE_APP__?.setState` to orchestrate transitions from
   any page, preloader or widget.
