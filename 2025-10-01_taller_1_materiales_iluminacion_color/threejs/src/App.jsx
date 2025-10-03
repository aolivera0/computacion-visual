import * as THREE from 'three'
import { Canvas, useThree, extend, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF, shaderMaterial, useTexture } from '@react-three/drei'
import { useState, useRef, useEffect } from 'react'

// ---------------------
// Shader Procedural (damero + ruido)
// ---------------------
const ProceduralMaterial = shaderMaterial(
  {
    cellSize: 10.0,
    noiseScale: 5.0,
    intensity: 0.5,
    color1: new THREE.Color("#ffffff"),
    color2: new THREE.Color("#000000"),
    roughness: 0.8,
    metalness: 0.2,
    lightDirection: new THREE.Vector3(0.5, 1.0, 0.8).normalize()
  },
  // vertex
  `
  varying vec2 vUv;
  varying vec3 vNormal;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
  }
  `,
  // fragment
  `
  varying vec2 vUv;
  varying vec3 vNormal;

  uniform float cellSize;
  uniform float noiseScale;
  uniform float intensity;
  uniform vec3 color1;
  uniform vec3 color2;
  uniform float roughness;
  uniform float metalness;
  uniform vec3 lightDirection;

  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233)))*43758.5453123);
  }

  float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    vec2 u = f*f*(3.0-2.0*f);
    return mix(a, b, u.x) +
           (c - a)* u.y * (1.0 - u.x) +
           (d - b) * u.x * u.y;
  }

  void main() {
    vec2 grid = floor(vUv * cellSize);
    float checker = mod(grid.x + grid.y, 2.0);
    float n = noise(vUv * noiseScale);

    vec3 baseColor = mix(color1, color2, checker);
    baseColor = mix(baseColor, vec3(n), intensity);

    vec3 normal = normalize(vNormal);
    vec3 lightDir = normalize(lightDirection);
    float diff = max(dot(normal, lightDir), 0.0);

    float finalMetal = metalness * (0.5 + n * 0.5);
    float finalRough = roughness * (0.5 + checker * 0.5);

    vec3 diffuse = baseColor * diff;
    vec3 ambient = baseColor * 0.3;
    vec3 finalColor = mix(diffuse + ambient, vec3(0.9,0.9,0.9), finalMetal*0.2);

    gl_FragColor = vec4(finalColor, 1.0);
  }
  `
)
extend({ ProceduralMaterial })

// ---------------------
// Suelo PBR (texturas)
// ---------------------
function SueloPBR() {
  const [colorMap, normalMap, roughnessMap, displacementMap] = useTexture([
    '/texturas/Stylized_Wood_Planks_003_basecolor.png',
    '/texturas/Stylized_Wood_Planks_003_normal.png',
    '/texturas/Stylized_Wood_Planks_003_roughness.png',
    '/texturas/Stylized_Wood_Planks_003_height.png',
  ])

  // aplicar wrapping & repeat
  ;[colorMap, normalMap, roughnessMap, displacementMap].forEach((tex) => {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(15, 15)
  })

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[50, 50]} />
      <meshStandardMaterial
        map={colorMap}
        normalMap={normalMap}
        roughnessMap={roughnessMap}
        displacementMap={displacementMap}
        displacementScale={0.1}
        roughness={0.9}
        metalness={0.1}
      />
    </mesh>
  )
}


// ---------------------
// Suelo Procedural (shader)
// ---------------------
function SueloProcedural() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
      <planeGeometry args={[50, 50, 256, 256]} />
      <proceduralMaterial
        cellSize={12.0}
        noiseScale={6.0}
        intensity={0.4}
        color1={"#f0e68c"}
        color2={"#556b2f"}
        roughness={0.9}
        metalness={0.2}
      />
    </mesh>
  )
}

// ---------------------
// Escena de luces (presets)
// ---------------------
function EscenaLuces({ preset = "day" }) {
  if (preset === "day") {
    return (
      <>
        <directionalLight position={[5, 5, 5]} intensity={1.2} color={"#ffffff"} castShadow />
        <directionalLight position={[-5, 2, 2]} intensity={0.6} color={"#a0c8ff"} />
        <ambientLight intensity={0.4} />
      </>
    )
  }

  if (preset === "sunset") {
    return (
      <>
        <directionalLight position={[5, 3, 3]} intensity={1.0} color={"#ffb347"} castShadow />
        <directionalLight position={[-5, 2, 2]} intensity={0.5} color={"#4a90e2"} />
        <ambientLight intensity={0.7} color={"#ffe5b4"} />
      </>
    )
  }

  return null
}

// ---------------------
// Luz animada (sol móvil)
// ---------------------
function LuzAnimada() {
  const lightRef = useRef()
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (lightRef.current) {
      lightRef.current.position.x = Math.sin(t * 0.3) * 6
      lightRef.current.position.y = 4 + Math.sin(t * 0.5)
      lightRef.current.position.z = Math.cos(t * 0.3) * 6
    }
  })
  return <directionalLight ref={lightRef} intensity={1.1} color={"#fff7d6"} castShadow />
}

// ---------------------
// Cámaras (perspectiva + ortográfica)
// ---------------------
function CameraSetup({ type }) {
  const { set, size } = useThree()
  const perspectiveRef = useRef()
  const orthoRef = useRef()

  useEffect(() => {
    // actualiza cámara activa según tipo
    if (type === "perspective" && perspectiveRef.current) {
      set({ camera: perspectiveRef.current })
      perspectiveRef.current.lookAt(0, 0, 0)
      perspectiveRef.current.updateProjectionMatrix()
    }
    if (type === "orthographic" && orthoRef.current) {
      set({ camera: orthoRef.current })
      orthoRef.current.lookAt(0, 0, 0)
      orthoRef.current.updateProjectionMatrix()
    }
  }, [type, set, size])

  const aspect = size.width / size.height
  const frustumSize = 10

  return (
    <>
      <perspectiveCamera
        ref={perspectiveRef}
        makeDefault={false}
        fov={50}
        position={[3, 3, 6]}
        near={0.1}
        far={100}
      />
      <orthographicCamera
        ref={orthoRef}
        makeDefault={false}
        left={(-frustumSize * aspect) / 2}
        right={(frustumSize * aspect) / 2}
        top={frustumSize / 2}
        bottom={-frustumSize / 2}
        near={0.1}
        far={100}
        position={[5, 5, 5]}
      />
    </>
  )
}

// ---------------------
// Cámara animada (recorrido corto) — usa la cámara activa
// ---------------------
function CameraAnimada({ enabled }) {
  const { camera } = useThree()
  useFrame(({ clock }) => {
    if (!enabled) return
    const t = clock.getElapsedTime()
    const radius = 12
    camera.position.x = Math.sin(t * 0.2) * radius
    camera.position.z = Math.cos(t * 0.2) * radius
    camera.position.y = 4
    camera.lookAt(0, 0, 0)
  })
  return null
}

// ---------------------
// Modelo animado: miModelo.glb (rotando)
// ---------------------
function ModeloAnimado({ url, scale = 1, position = [0, 0, 0] }) {
  const { scene } = useGLTF(url)
  const ref = useRef()

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.5
    }
  })

  return <primitive ref={ref} object={scene} scale={scale} position={position} />
}

// ---------------------
// Modelo estático
// ---------------------
function Modelo({ url, scale = 1, position = [0, 0, 0] }) {
  const { scene } = useGLTF(url)
  return <primitive object={scene} scale={scale} position={position} />
}

// ---------------------
// App principal
// ---------------------
export default function App() {
  const [preset, setPreset] = useState("day")
  const [cameraType, setCameraType] = useState("perspective")
  const [soilType, setSoilType] = useState("pbr")
  const [cameraAnim, setCameraAnim] = useState(true)

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      {/* UI */}
      <div style={{ position: "absolute", top: 20, left: 20, zIndex: 1 }}>
        <button onClick={() => setPreset("day")}>☀️ Día</button>
        <button onClick={() => setPreset("sunset")} style={{ marginLeft: 10 }}>🌅 Atardecer</button>

        <button onClick={() => setCameraType("perspective")} style={{ marginLeft: 30 }}>🎥 Perspectiva</button>
        <button onClick={() => setCameraType("orthographic")} style={{ marginLeft: 10 }}>📐 Ortográfica (Iso)</button>

        <button onClick={() => setSoilType(soilType === "pbr" ? "procedural" : "pbr")} style={{ marginLeft: 30 }}>
          🟫 Cambiar Suelo ({soilType === "pbr" ? "PBR" : "Procedural"})
        </button>

        <button onClick={() => setCameraAnim(!cameraAnim)} style={{ marginLeft: 30 }}>
          🎬 Cámara Animada: {cameraAnim ? "ON" : "OFF"}
        </button>
      </div>

      <Canvas shadows>
        {/* Setup de cámaras (ahora sí) */}
        <CameraSetup type={cameraType} />

        {/* Cámara animada (usa la cámara activa) */}
        <CameraAnimada enabled={cameraAnim} />

        {/* Luces preset + sol animado */}
        <EscenaLuces preset={preset} />
        <LuzAnimada />

        {/* Modelos: miModelo rotando + otros */}
        <ModeloAnimado url="/modelos/miModelo.glb" scale={2.5} position={[-4, 0, 0]} />
        <Modelo url="/modelos/ramen-yatai.glb" scale={0.5} position={[0, 0, 0]} />
        <Modelo url="/modelos/oil_drums.glb" scale={2} position={[3, 0, -4]} />

        {/* Suelo (alterna entre PBR y Procedural) */}
        {soilType === "pbr" ? <SueloPBR /> : <SueloProcedural />}

        {/* OrbitControls: deshabilita mientras la cámara animada está ON */}
        <OrbitControls enabled={!cameraAnim} />

      </Canvas>
    </div>
  )
}
