# Sharlee‑Clone Portfolio

This folder contains a ready‑to‑use **Next.js 14** project scaffolded with the
new **App Router** and configured to work with
[@react‑three/fiber](https://github.com/pmndrs/react-three-fiber) and
[@react‑three/drei](https://github.com/pmndrs/drei).  The goal of this
project is to reproduce the look and feel of the portfolio at
[`itssharl.ee`](https://itssharl.ee/) without relying on any external
geometry files or Blender exports.  All shapes are generated
procedurally using Three.js primitives (e.g. `TorusGeometry`,
`TubeGeometry`, `SphereGeometry`, etc.) and animated via
[`@react‑spring/three`](https://github.com/pmndrs/react-spring).  A
custom shader material provides a subtle gradient with a fresnel rim
lighting effect, matching the glossy “blob” aesthetic of the original site.

## Getting started

1. **Install dependencies**

   ```bash
   npm install
   ```

   The `package.json` lists the necessary packages: `react`,
   `next@canary`, `@react-three/fiber`, `@react-three/drei`,
   `@react-spring/three`, and `zustand` for state management.  Note
   that at the time of writing you may need the `canary` channel for
   Next 14 in order to use the App Router.  If you are targeting
   another version of Next please adjust accordingly.

2. **Run the development server**

   ```bash
   npm run dev
   ```

   The site will be available at [http://localhost:3000](http://localhost:3000).
   Each page (`/`, `/about`, `/work` and `/contact`) sets a different
   configuration for the shapes.  Hovering over the navigation items
   gently scales them and clicking changes the variant.  A custom
   preloader uses the `useProgress` hook from `drei` to report the
   loading progress; it is displayed until all assets in the scene have
   been downloaded.

3. **Editing shapes**

   The file at `components/three/ProceduralShapes.tsx` defines helper
   functions for creating each shape.  You can experiment with
   different geometries by changing the radius, tube thickness or the
   control points used for the `CatmullRomCurve3` S‑shape.  The
   animations for each page are defined in `store/variants.ts`.

4. **Changing the material**

   The custom shader material lives in `materials/GradientMat.tsx`.  It
   supports two colour uniforms (`colorA` and `colorB`) and a
   `fresnelStrength` uniform controlling the intensity of the rim light.
   Feel free to adjust these values or replace the shader with any
   other `THREE.Material`.

5. **Extending the project**

   This scaffold purposefully stays close to the original site’s
   structure: there is no layout thrashing, the canvas is rendered
   on every page and the navigation triggers animations rather than
   remounting the entire scene.  You can build upon this foundation to
   include additional sections, integrate CMS content or implement
   custom interactions.
