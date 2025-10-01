import * as THREE from "three";

const textureCache = new Map<string, Promise<THREE.Texture>>();

export async function loadMatcap(url: string) {
  if (!textureCache.has(url)) {
    const loader = new THREE.TextureLoader();
    const promise = new Promise<THREE.Texture>((resolve, reject) => {
      loader.load(
        url,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          resolve(texture);
        },
        undefined,
        reject,
      );
    });
    textureCache.set(url, promise);
  }

  return textureCache.get(url)!;
}
