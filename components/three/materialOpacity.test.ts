import { describe, expect, it } from "vitest";
import { Mesh, MeshBasicMaterial, SphereGeometry } from "three";

import {
  VISIBLE_OPACITY_THRESHOLD,
  applyOpacityToMesh,
} from "./materialOpacity";

const createMesh = (transparent: boolean) =>
  new Mesh(new SphereGeometry(1, 4, 4), new MeshBasicMaterial({ transparent }));

describe("applyOpacityToMesh", () => {
  it("skips drawing shapes that are fully faded out", () => {
    const mesh = createMesh(true);

    applyOpacityToMesh(mesh, 0);
    expect(mesh.visible).toBe(false);

    applyOpacityToMesh(mesh, VISIBLE_OPACITY_THRESHOLD * 2);
    expect(mesh.visible).toBe(true);
  });

  it("never flips the shader variant of an already transparent material", () => {
    const mesh = createMesh(true);
    const material = mesh.material as MeshBasicMaterial;
    const versionBefore = material.version;

    for (const opacity of [1, 0.4, 0, 0.7, 1]) {
      applyOpacityToMesh(mesh, opacity);
    }

    expect(material.transparent).toBe(true);
    expect(material.opacity).toBe(1);
    // `needsUpdate` bumps the version; opacity-only changes must not.
    expect(material.version).toBe(versionBefore);
  });

  it("makes an opaque material transparent once it starts fading", () => {
    const mesh = createMesh(false);
    const material = mesh.material as MeshBasicMaterial;

    applyOpacityToMesh(mesh, 0.5);

    expect(material.transparent).toBe(true);
    expect(material.opacity).toBe(0.5);
  });
});
