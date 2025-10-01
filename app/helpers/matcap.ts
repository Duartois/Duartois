import * as THREE from "three";

export async function loadMatcap(url: string) {
  const loader = new THREE.TextureLoader();
  const tex = await new Promise<THREE.Texture>((res, rej) => {
    loader.load(url, res, undefined, rej);
  });
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}