import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const DRACO_DECODER_PATH = "/draco/";

export const createDracoLoader = () => {
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath(DRACO_DECODER_PATH);
  return dracoLoader;
};

export const createDracoEnabledGLTFLoader = () => {
  const dracoLoader = createDracoLoader();
  const gltfLoader = new GLTFLoader();
  gltfLoader.setDRACOLoader(dracoLoader);
  return { gltfLoader, dracoLoader };
};

// Para comprimir novos modelos com Draco, gere o .glb/.gltf com um encoder Draco
// (ex.: `npx gltf-transform draco input.glb output-draco.glb`) e salve em public/models.
export const loadDracoGLTF = async (url: string) => {
  const { gltfLoader, dracoLoader } = createDracoEnabledGLTFLoader();

  try {
    return await gltfLoader.loadAsync(url);
  } finally {
    dracoLoader.dispose();
  }
};