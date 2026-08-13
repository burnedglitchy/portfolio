import { Canvas } from '@react-three/fiber'
import { useFrame, useThree } from '@react-three/fiber'
import { Suspense, useLayoutEffect } from 'react'
import * as THREE from 'three'
import { sceneBridge } from './bridge'
import { HeroScene } from './scenes/HeroScene'

function ThemeClearColor() {
  const { gl } = useThree()
  const clearColor = new THREE.Color()

  useFrame(() => {
    const background = sceneBridge.themeTokens.current.background

    if (background) {
      gl.setClearColor(clearColor.set(background), 1)
    }
  })

  return null
}

function StaticHeroCamera() {
  const { camera } = useThree()

  useLayoutEffect(() => {
    camera.lookAt(0, 0.7, 0)
    camera.updateProjectionMatrix()
  }, [camera])

  return null
}

export function SceneCanvas() {
  return (
    <Canvas
      aria-hidden="true"
      camera={{ far: 100, fov: 42, near: 0.1, position: [0, 0, 13.5] }}
      className="scene-canvas"
      dpr={[1, 2]}
      gl={{ alpha: false, powerPreference: 'high-performance' }}
    >
      <Suspense fallback={null}>
        <ThemeClearColor />
        <StaticHeroCamera />
        <HeroScene />
      </Suspense>
    </Canvas>
  )
}
