import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useRef } from 'react'

function AnimatedCube() {
  const meshRef = useRef()

  useFrame((state) => {
    const t = state.clock.elapsedTime

    // ---- Trayectoria circular ----
    const radius = 2
    meshRef.current.position.x = Math.cos(t) * radius
    meshRef.current.position.y = Math.sin(t) * radius

    // ---- Rotación constante ----
    meshRef.current.rotation.x += 0.02
    meshRef.current.rotation.y += 0.01

    // ---- Escala oscilante ----
    const scale = 1 + 0.3 * Math.sin(t * 2)
    meshRef.current.scale.set(scale, scale, scale)
  })

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  )
}

export default function App() {
  return (
    <Canvas camera={{ position: [5, 5, 5], fov: 60 }}>
      {/* Luces */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />

      {/* Objeto animado */}
      <AnimatedCube />

      {/* Bonus: OrbitControls */}
      <OrbitControls />
    </Canvas>
  )
}
