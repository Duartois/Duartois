import {
  BufferAttribute,
  CatmullRomCurve3,
  Color,
  DoubleSide,
  Group,
  IcosahedronGeometry,
  LatheGeometry,
  Mesh,
  PerspectiveCamera,
  ShaderMaterial,
  TorusGeometry,
  TubeGeometry,
  Vector2,
  Vector3,
} from "three";

import {
  LIGHT_THEME_PALETTE,
  type GradientPalette,
  type GradientStops,
  type ThemeName,
  type VariantState,
  createVariantState,
  getDefaultPalette,
} from "./types";

export type GradientMaterialUniforms = {
  uColor1: { value: Color };
  uColor2: { value: Color };
  uColor3: { value: Color };
  uColor4: { value: Color };
  uTime: { value: number };
  uAmp: { value: number };
  uFreq: { value: number };
  uNoiseScale: { value: number };
};

export type GradientMaterial = ShaderMaterial & {
  uniforms: GradientMaterialUniforms;
};

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uAmp;
  uniform float uFreq;
  uniform float uNoiseScale;

  varying vec3 vWorldPos;
  varying vec3 vNormal;
  varying float vRipple;

  vec3 mod289(vec3 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }

  vec4 mod289(vec4 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }

  vec4 permute(vec4 x) {
    return mod289(((x*34.0)+1.0)*x);
  }

  vec4 taylorInvSqrt(vec4 r)
  {
    return 1.79284291400159 - 0.85373472095314 * r;
  }

  float snoise(vec3 v)
  {
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 =   v - i + dot(i, C.xxx) ;

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute( permute( permute(
               i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
             + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

    float n_ = 0.142857142857;
    vec3  ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                  dot(p2,x2), dot(p3,x3) ) );
  }

  void main() {
    vec3 displaced = position;
    float ripple = 0.0;

    vec4 world = modelMatrix * vec4(displaced, 1.0);
    vWorldPos = world.xyz;
    vNormal = normalize(normalMatrix * normal);
    vRipple = ripple;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  uniform vec3 uColor4;

  varying vec3 vWorldPos;
  varying vec3 vNormal;
  varying float vRipple;

  vec3 sampleGradient(float h) {
    vec3 c12 = mix(uColor1, uColor2, smoothstep(0.0, 0.33, h));
    vec3 c23 = mix(uColor2, uColor3, smoothstep(0.33, 0.66, h));
    vec3 c34 = mix(uColor3, uColor4, smoothstep(0.66, 1.0, h));
    vec3 blend = mix(c12, c23, smoothstep(0.2, 0.75, h));
    return mix(blend, c34, smoothstep(0.6, 1.0, h));
  }

  void main() {
    float height = clamp(vWorldPos.y * 0.32 + 0.5, 0.0, 1.0);
    vec3 gradient = sampleGradient(height);

    vec3 viewDir = normalize(cameraPosition - vWorldPos);
    vec3 normal = normalize(vNormal);

    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.5);
    float rippleGlow = 0.05;

    vec3 colour = gradient + fresnel * 0.45 + rippleGlow * 0.18;
    gl_FragColor = vec4(clamp(colour, 0.0, 1.0), 1.0);
  }
`;

const createGradientMaterial = () => {
  const material = new ShaderMaterial({
    uniforms: {
      uColor1: { value: new Color("#f4ebff") },
      uColor2: { value: new Color("#dcc8ff") },
      uColor3: { value: new Color("#c1a6ff") },
      uColor4: { value: new Color("#9d7aff") },
      uTime: { value: 0 },
      uAmp: { value: 0 },
      uFreq: { value: 1.25 },
      uNoiseScale: { value: 0 },
    },
    vertexShader,
    fragmentShader,
  }) as GradientMaterial;

  material.transparent = false;
  material.depthWrite = true;

  return material;
};

export const MATERIAL_CONFIGS = [
  { amp: 0, freq: 1.15, timeOffset: 0 },
  { amp: 0, freq: 1.05, timeOffset: 0.72 },
  { amp: 0, freq: 1.32, timeOffset: 1.46 },
  { amp: 0, freq: 0.96, timeOffset: 2.18 },
  { amp: 0, freq: 1.25, timeOffset: 2.94 },
  { amp: 0, freq: 0.86, timeOffset: 3.58 },
] as const;

export const createGradientMaterials = () =>
  MATERIAL_CONFIGS.map(() => createGradientMaterial()) as [
    GradientMaterial,
    GradientMaterial,
    GradientMaterial,
    GradientMaterial,
    GradientMaterial,
    GradientMaterial,
  ];

const applyStops = (material: GradientMaterial, stops: GradientStops) => {
  material.uniforms.uColor1.value.set(stops[0]);
  material.uniforms.uColor2.value.set(stops[1]);
  material.uniforms.uColor3.value.set(stops[2]);
  material.uniforms.uColor4.value.set(stops[3]);
};

export const applyPaletteToMaterials = (
  materials: readonly GradientMaterial[],
  palette: GradientPalette,
) => {
  materials.forEach((material, index) => {
    const stops = palette[index] ?? LIGHT_THEME_PALETTE[index];
    applyStops(material, stops);
  });
};

const createArcGeometry = ({
  radius,
  thickness,
  arc,
  tilt,
  squishY,
  squishZ,
  offset,
}: {
  radius: number;
  thickness: number;
  arc: number;
  tilt: number;
  squishY: number;
  squishZ: number;
  offset: Vector3;
}) => {
  const geometry = new TorusGeometry(radius, thickness, 96, 320, arc);
  geometry.scale(1, squishY, squishZ);
  geometry.rotateX(Math.PI / 2);
  geometry.rotateZ(tilt);
  geometry.translate(offset.x, offset.y, offset.z);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
};

const createPetalGeometry = ({
  height,
  radiusTop,
  radiusBottom,
  pinch,
  steps,
  twist,
}: {
  height: number;
  radiusTop: number;
  radiusBottom: number;
  pinch: number;
  steps: number;
  twist: number;
}) => {
  const points: Vector2[] = [];
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const eased = Math.pow(t, 0.85);
    const radius =
      radiusBottom + (radiusTop - radiusBottom) * eased + Math.sin(t * Math.PI) * pinch;
    const y = (t - 0.5) * height;
    points.push(new Vector2(radius, y));
  }

  const geometry = new LatheGeometry(points, 96);
  geometry.rotateX(Math.PI / 2);
  geometry.rotateZ(twist);
  geometry.scale(0.82, 0.82, 0.82);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
};

const createRibbonGeometry = () => {
  const curve = new CatmullRomCurve3(
    [
      new Vector3(-1.85, -0.85, 0.35),
      new Vector3(-0.95, 0.55, -0.12),
      new Vector3(0.2, -0.25, 0.2),
      new Vector3(1.35, 0.65, -0.18),
      new Vector3(2.05, 0.15, 0.3),
    ],
    false,
    "centripetal",
    0.6,
  );
  const geometry = new TubeGeometry(curve, 360, 0.2, 64, false);
  geometry.scale(1.05, 0.78, 1.2);
  geometry.rotateZ(Math.PI / 8);
  geometry.rotateX(Math.PI / 12);
  geometry.translate(-0.05, 0.1, 0);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
};

const createRippleSphereGeometry = () => {
  const geometry = new IcosahedronGeometry(0.6, 4);
  const positions = geometry.getAttribute("position") as BufferAttribute;
  for (let i = 0; i < positions.count; i += 1) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);
    const radial = Math.sqrt(x * x + y * y + z * z);
    const wave = 1 + 0.12 * Math.sin(radial * 5.5 + x * 3) + 0.06 * Math.cos(y * 7.2);
    positions.setXYZ(i, x * wave, y * wave, z * wave);
  }
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
};

export const createGeometries = () => {
  const torus270A = createArcGeometry({
    radius: 1.7,
    thickness: 0.36,
    arc: Math.PI * 1.75,
    tilt: Math.PI / 5,
    squishY: 0.82,
    squishZ: 1.1,
    offset: new Vector3(-0.25, 0.08, 0.1),
  });
  const torus270B = createArcGeometry({
    radius: 1.4,
    thickness: 0.3,
    arc: Math.PI * 1.62,
    tilt: -Math.PI / 4.5,
    squishY: 0.9,
    squishZ: 0.92,
    offset: new Vector3(0.18, -0.05, -0.08),
  });
  const semi180A = createPetalGeometry({
    height: 2.1,
    radiusTop: 0.55,
    radiusBottom: 0.95,
    pinch: 0.22,
    steps: 48,
    twist: Math.PI / 9,
  });
  const semi180B = createPetalGeometry({
    height: 1.85,
    radiusTop: 0.45,
    radiusBottom: 0.78,
    pinch: 0.18,
    steps: 42,
    twist: -Math.PI / 7,
  });
  const wave = createRibbonGeometry();
  const sphere = createRippleSphereGeometry();

  return { torus270A, torus270B, semi180A, semi180B, wave, sphere };
};

export type SceneObjects = {
  group: Group;
  meshes: Record<keyof VariantState, Mesh>;
  materials: ReturnType<typeof createGradientMaterials>;
  dispose: () => void;
};

export const createSceneObjects = (palette: GradientPalette): SceneObjects => {
  const materials = createGradientMaterials();
  applyPaletteToMaterials(materials, palette);

  const geometries = createGeometries();

  const group = new Group();
  group.position.set(0, 0, 0);

  const meshEntries: [keyof VariantState, Mesh][] = [
    ["torus270A", new Mesh(geometries.torus270A, materials[0])],
    ["torus270B", new Mesh(geometries.torus270B, materials[1])],
    ["semi180A", new Mesh(geometries.semi180A, materials[2])],
    ["semi180B", new Mesh(geometries.semi180B, materials[3])],
    ["wave", new Mesh(geometries.wave, materials[4])],
    ["sphere", new Mesh(geometries.sphere, materials[5])],
  ];

  meshEntries.forEach(([, mesh]) => {
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    const shaderMaterial = mesh.material as GradientMaterial;
    shaderMaterial.side = DoubleSide;
    mesh.rotation.set(0, 0, 0);
    group.add(mesh);
  });

  meshEntries[0][1].scale.setScalar(1.18);
  meshEntries[1][1].scale.setScalar(1.05);
  meshEntries[2][1].scale.set(0.92, 0.92, 0.92);
  meshEntries[3][1].scale.set(0.86, 0.86, 0.86);
  meshEntries[4][1].scale.set(1.12, 1.12, 1.12);
  meshEntries[5][1].scale.setScalar(0.94);

  const dispose = () => {
    meshEntries.forEach(([, mesh]) => {
      mesh.geometry.dispose();
    });
    materials.forEach((material) => material.dispose());
  };

  return {
    group,
    meshes: Object.fromEntries(meshEntries) as SceneObjects["meshes"],
    materials,
    dispose,
  };
};

export const updateMeshesFromVariant = (
  meshes: SceneObjects["meshes"],
  variant: VariantState,
) => {
  (Object.keys(meshes) as (keyof VariantState)[]).forEach((key, index) => {
    const mesh = meshes[key];
    const target = variant[key];
    mesh.position.set(...target.position);
    mesh.rotation.set(...target.rotation);
    if (mesh.material && "uniforms" in mesh.material) {
      const material = mesh.material as GradientMaterial;
      material.uniforms.uAmp.value = MATERIAL_CONFIGS[index].amp;
      material.uniforms.uFreq.value = MATERIAL_CONFIGS[index].freq;
    }
  });
};

export const createCamera = () => {
  const camera = new PerspectiveCamera(40, 1, 0.1, 50);
  camera.position.set(0, 0, 6);
  return camera;
};

export const cloneVariant = (variant: VariantState) => createVariantState(variant);

export const ensurePalette = (
  palette: GradientPalette | undefined,
  theme: ThemeName,
): GradientPalette => palette ?? getDefaultPalette(theme);
