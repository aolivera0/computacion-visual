// src/App.jsx 
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import { useState } from 'react'

// Componente genérico de modelo
function Modelo({ url, scale = 1, position = [0, 0, 0] }) {
  const { scene } = useGLTF(url)
  return <primitive object={scene} scale={scale} position={position} />
}

// Componente para la iluminación con presets
function EscenaLuces({ preset = "day" }) {
  if (preset === "day") {
    return (
      <>
        {/* Key light (frontal, blanco frío) */}
        <directionalLight position={[5, 5, 5]} intensity={1.2} color={"#ffffff"} />
        {/* Fill light (lado opuesto, azulada) */}
        <directionalLight position={[-5, 2, 2]} intensity={0.6} color={"#a0c8ff"} />
        {/* Rim light (trasera, blanca) */}
        <directionalLight position={[0, 5, -5]} intensity={0.8} color={"#ffffff"} />
        {/* Ambient light */}
        <ambientLight intensity={0.4} />
      </>
    )
  }

  if (preset === "sunset") {
    return (
      <>
        {/* Key light cálida (naranja) */}
        <directionalLight position={[5, 3, 3]} intensity={1.2} color={"#ffb347"} />
        {/* Fill light fría (azulada) */}
        <directionalLight position={[-5, 2, 2]} intensity={0.5} color={"#4a90e2"} />
        {/* Rim light rosada (efecto de atardecer) */}
        <directionalLight position={[0, 4, -4]} intensity={0.7} color={"#ff6b6b"} />
        {/* Ambient tenue */}
        <ambientLight intensity={0.3} color={"#ffe5b4"} />
      </>
    )
  }

  return null
}

// Suelo con parametros de textura
function Suelo() {
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[50, 50]} />
      <meshStandardMaterial color="#193d10ff" roughness={0.9} metalness={0.1} />
    </mesh>
  )
}

export default function App() {
  const [preset, setPreset] = useState("day")

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      {/* Botón para cambiar de preset */}
      <div style={{ position: "absolute", top: 20, left: 20, zIndex: 1 }}>
        <button onClick={() => setPreset("day")}>☀️ Día</button>
        <button onClick={() => setPreset("sunset")} style={{ marginLeft: 10 }}>🌅 Atardecer</button>
      </div>

      <Canvas camera={{ position: [3, 3, 6], fov: 50 }} shadows>
        {/* Luces según el preset */}
        <EscenaLuces preset={preset} />

        {/* Suelo */}
        <Suelo />

        {/* Modelos */}
        <Modelo url="/modelos/miModelo.glb" scale={2.5} position={[-4, 0, 0]} />
        <Modelo url="/modelos/ramen-yatai.glb" scale={0.5} position={[0, 0, 0]} />
        <Modelo url="/modelos/oil_drums.glb" scale={2} position={[3, 0, -4]} />

        {/* Controles */}
        <OrbitControls />
      </Canvas>
    </div>
  )
}
