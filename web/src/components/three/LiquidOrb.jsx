import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshTransmissionMaterial } from '@react-three/drei'

function GlassCore() {
  const ref = useRef(null)

  useFrame((_, delta) => {
    if (!ref.current) return
    ref.current.rotation.x += delta * 0.11
    ref.current.rotation.y += delta * 0.17
  })

  return (
    <group ref={ref}>
      <mesh scale={1.2}>
        <icosahedronGeometry args={[1, 12]} />
        <MeshTransmissionMaterial
          backside
          backsideThickness={0.6}
          samples={6}
          resolution={256}
          transmission={1}
          roughness={0.06}
          thickness={1.2}
          chromaticAberration={0.08}
          anisotropicBlur={0.15}
          distortion={0.45}
          distortionScale={0.6}
          temporalDistortion={0.15}
          color="#c4b5fd"
          attenuationColor="#7c3aed"
          attenuationDistance={1.6}
        />
      </mesh>
      <mesh scale={0.58}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshBasicMaterial color="#8b5cf6" transparent opacity={0.35} />
      </mesh>
    </group>
  )
}

function Spark({ position, color, scale }) {
  const ref = useRef(null)

  useFrame((state) => {
    if (!ref.current) return
    ref.current.position.y =
      position[1] + Math.sin(state.clock.elapsedTime * 1.6 + position[0]) * 0.14
  })

  return (
    <mesh ref={ref} position={position} scale={scale}>
      <sphereGeometry args={[1, 24, 24]} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  )
}

export default function LiquidOrb({ className = '' }) {
  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, 0, 5.2], fov: 42 }}
        dpr={[1, 1.75]}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.8} />
        <pointLight position={[4, 3, 5]} intensity={40} color="#a78bfa" />
        <pointLight position={[-4, -2, 4]} intensity={30} color="#22d3ee" />
        <Float speed={1.2} rotationIntensity={0.25} floatIntensity={0.5}>
          <GlassCore />
        </Float>
        <Spark position={[2.1, 1.1, -1]} color="#22d3ee" scale={0.07} />
        <Spark position={[-2.2, -1.2, -0.5]} color="#a78bfa" scale={0.05} />
        <Spark position={[1.8, -1.6, -1.5]} color="#f0abfc" scale={0.04} />
      </Canvas>
    </div>
  )
}
