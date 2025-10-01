import { OrthographicCamera } from "three";

import {
  type GradientPalette,
  type ThemeName,
  type VariantState,
  createVariantState,
  getDefaultPalette,
} from "./types";

<<<<<<< HEAD
=======
export type GradientMaterialUniforms = {
  uColor1: { value: Color };
  uColor2: { value: Color };
  uColor3: { value: Color };
  uColor4: { value: Color };
  uOpacity: { value: number };
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
  uniform float uOpacity;

  varying vec3 vWorldPos;
  varying vec3 vNormal;

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
    vec4 world = modelMatrix * vec4(displaced, 1.0);
    vWorldPos = world.xyz;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  uniform vec3 uColor4;
  uniform float uOpacity;

  varying vec3 vWorldPos;
  varying vec3 vNormal;

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
    vec3 lightDir = normalize(vec3(-0.35, 0.78, 0.42));

    float diffuse = max(dot(normal, lightDir), 0.0);
    vec3 diffuseColor = gradient * (0.7 + diffuse * 0.65);

    vec3 halfway = normalize(lightDir + viewDir);
    float specular = pow(max(dot(normal, halfway), 0.0), 16.0);
    float rim = pow(1.0 - max(dot(normal, viewDir), 0.0), 2.2) * 0.35;

    vec3 colour = diffuseColor + specular * 0.12 + rim;
    gl_FragColor = vec4(clamp(colour, 0.0, 1.0), clamp(uOpacity, 0.0, 1.0));
  }
`;

const createGradientMaterial = () => {
  const material = new ShaderMaterial({
    uniforms: {
      uColor1: { value: new Color("#f9d7fb") },
      uColor2: { value: new Color("#f3f6c8") },
      uColor3: { value: new Color("#a8f0d6") },
      uColor4: { value: new Color("#a1c8ff") },
      uOpacity: { value: 1 },
      uTime: { value: 0 },
      uAmp: { value: 0 },
      uFreq: { value: 1.25 },
      uNoiseScale: { value: 0 },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
  }) as GradientMaterial;

  // ---- aliases de compatibilidade (evita crash quando trocar nomes) ----
  const u: any = material.uniforms;
  if (!u.uNoiseAmp && u.uAmp) u.uNoiseAmp = u.uAmp;
  if (!u.uNoiseFreq && u.uFreq) u.uNoiseFreq = u.uFreq;

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
  arc,
  thickness,
  depth,
  lift,
  tilt,
  roll,
}: {
  radius: number;
  arc: number;
  thickness: number;
  depth: number;
  lift: number;
  tilt: number;
  roll: number;
}) => {
  const start = -arc / 2;
  const end = arc / 2;
  const controlPoints: Vector3[] = [];
  const steps = 14;
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const angle = start + (end - start) * t;
    const eased = Math.sin(t * Math.PI);
    const bulge = 1 + Math.pow(eased, 1.4) * depth * 0.38;
    const r = radius * bulge;
    const liftOffset = 1 + Math.pow(eased, 1.6) * lift * 0.45;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r * liftOffset;
    const z = eased * depth * 0.18;
    controlPoints.push(new Vector3(x, y, z));
  }

  const curve = new CatmullRomCurve3(controlPoints, false, "centripetal", 0.5);
  const geometry = new TubeGeometry(curve, 720, thickness, 96, false);
  geometry.rotateX(Math.PI / 2 + tilt);
  geometry.rotateZ(roll);
  geometry.scale(1.04, 1.0, 1.02);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
};

const createRibbonGeometry = () => {
  const path = new CatmullRomCurve3(
    [
      new Vector3(-1.96, 0.86, 0.18),
      new Vector3(-1.44, 1.32, 0.52),
      new Vector3(-0.82, 1.24, 0.64),
      new Vector3(-0.28, 0.86, 0.36),
      new Vector3(0.26, 0.42, -0.12),
      new Vector3(0.86, 0.36, 0.18),
      new Vector3(1.34, 0.82, 0.54),
      new Vector3(1.88, 0.96, 0.26),
      new Vector3(2.32, 0.58, -0.04),
    ],
    false,
    "centripetal",
    0.52,
  );

  const geometry = new TubeGeometry(path, 540, 0.24, 64, false);
  geometry.scale(1.22, 1.18, 1.16);
  geometry.rotateZ(Math.PI / 14);
  geometry.rotateX(Math.PI / 18);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
};

const createRippleSphereGeometry = () => {
  const geometry = new SphereGeometry(0.64, 96, 96);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
};

export const createGeometries = () => {
  // 3) C-torus grande à direita
  const torus270A = createArcGeometry({
    radius: 1.22,                // raio maior
    arc: Math.PI * 1.55,         // ~279°
    thickness: 0.22,             // espessura do tubo
    depth: 0.10,                 // leve variação Z
    lift: 0.00,                  // sem “levantar” o arco
    tilt: 0.00,                  // sem inclinação X
    roll: -0.10,                 // leve giro Z
  });

  // 6) Arco inferior grande
  const torus270B = createArcGeometry({
    radius: 1.36,
    arc: Math.PI * 1.25,         // ~225°
    thickness: 0.26,
    depth: 0.10,
    lift: 0.00,
    tilt: 0.00,
    roll: 0.00,
  });

  // 5) C-torus médio (meio-esquerda)
  const semi180A = createArcGeometry({
    radius: 1.08,
    arc: Math.PI * 1.45,         // ~261°
    thickness: 0.20,
    depth: 0.10,
    lift: 0.00,
    tilt: 0.00,
    roll: 0.10,
  });

  // 4) “Feijão”/crescente (esquerda)
  const semi180B = createArcGeometry({
    radius: 0.98,
    arc: Math.PI * 1.10,         // ~198°
    thickness: 0.20,
    depth: 0.10,
    lift: 0.00,
    tilt: 0.00,
    roll: 0.00,
  });

  // 1) S-worm superior esquerdo (curva Catmull)
  const wave = createRibbonGeometry();

  // 2) Esfera pequena superior
  const sphere = createRippleSphereGeometry();

  return {
    torus270A,
    torus270B,
    semi180A,
    semi180B,
    wave,
    sphere,
  };
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

>>>>>>> b2054ea5e1c2b985ba486d7dce3322416ea89f15
export const createCamera = () => {
  const aspect = window.innerWidth / window.innerHeight;
  const camera = new OrthographicCamera(-aspect, aspect, 1, -1, 0.1, 50);
  camera.position.set(0, 0, 6);
  return camera;
};

export const cloneVariant = (variant: VariantState) => createVariantState(variant);

export const ensurePalette = (
  palette: GradientPalette | undefined,
  theme: ThemeName,
): GradientPalette => palette ?? getDefaultPalette(theme);
