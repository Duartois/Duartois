import * as THREE from "three";
import { loadMatcap } from "../../app/helpers/matcap";

export type ShapesHandle = {
  group: THREE.Group;
  update: (elapsed: number) => void;
};

export async function addSharleeLikeShapes(
  scene: THREE.Scene,
): Promise<ShapesHandle> {
  const [mc1, mc2, mc3, mc4, mc5] = await Promise.all([
    loadMatcap("/matcaps/pink.png"),
    loadMatcap("/matcaps/lilac.png"),
    loadMatcap("/matcaps/mint.png"),
    loadMatcap("/matcaps/aqua.png"),
    loadMatcap("/matcaps/peach.png"),
  ]);

  const group = new THREE.Group();
  scene.add(group);

  const meshes: THREE.Mesh[] = [];

  meshes.push(
    new THREE.Mesh(
      new THREE.TorusGeometry(1.25, 0.38, 64, 96),
      new THREE.MeshMatcapMaterial({ matcap: mc1, transparent: true, opacity: 1 }),
    ),
  );

  meshes.push(
    new THREE.Mesh(
      new THREE.SphereGeometry(0.95, 48, 48),
      new THREE.MeshMatcapMaterial({ matcap: mc2, transparent: true, opacity: 1 }),
    ),
  );

  meshes.push(
    new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.05, 1),
      new THREE.MeshMatcapMaterial({ matcap: mc3, transparent: true, opacity: 1 }),
    ),
  );

  meshes.push(
    new THREE.Mesh(
      new THREE.TorusKnotGeometry(1.0, 0.3, 128, 16, 2, 3),
      new THREE.MeshMatcapMaterial({ matcap: mc4, transparent: true, opacity: 1 }),
    ),
  );

  meshes.push(
    new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 1.1, 1.1, 3, 3, 3),
      new THREE.MeshMatcapMaterial({ matcap: mc5, transparent: true, opacity: 1 }),
    ),
  );

  const P: [number, number, number][] = [
    [-2.0, 0.2, 0.0],
    [1.2, 0.6, -0.6],
    [0.0, -0.8, 1.2],
    [2.0, 0.1, 0.8],
    [-1.1, -0.5, -1.2],
  ];

  meshes.forEach((m, i) => {
    m.position.set(...P[i]);
    m.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    m.castShadow = false;
    m.receiveShadow = false;
    group.add(m);
  });

  const update = (elapsed: number) => {
    meshes.forEach((m, i) => {
      m.rotation.x += 0.003 + i * 0.0004;
      m.rotation.y += 0.004 + i * 0.0003;
      const s = 1 + 0.03 * Math.sin(elapsed * 0.8 + i);
      m.scale.setScalar(s);
    });
  };

  return { group, update };
}