import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { HeroScene } from './scenes/HeroScene'

export function SceneCanvas() {
  return (
    <Canvas
      aria-hidden="true"
      camera={{ fov: 34, position: [0, 0, 8] }}
      className="scene-canvas"
      dpr={[1, 2]}
      gl={{ alpha: true, powerPreference: 'high-performance' }}
    >
      <Suspense fallback={null}>
        <HeroScene />
      </Suspense>
    </Canvas>
  )
}
