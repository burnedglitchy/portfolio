import { Preload, useGLTF } from '@react-three/drei'
import { useMemo } from 'react'
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js'
import * as THREE from 'three'
import { useTwoToneToonMaterial } from '../materials/TwoToneToonMaterial'

function applyToonMaterial(root: THREE.Object3D, material: THREE.ShaderMaterial) {
  root.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      // Replaces every source material, including the billboard's marketplace PBR materials.
      object.material = material
    }
  })

  return root
}

export function HeroScene() {
  const astronautAsset = useGLTF('/models/astronaut.glb')
  const billboardAsset = useGLTF('/models/billboard.glb')
  const material = useTwoToneToonMaterial()
  const astronaut = useMemo(
    () => applyToonMaterial(cloneSkeleton(astronautAsset.scene), material),
    [astronautAsset.scene, material],
  )
  const billboard = useMemo(
    () => applyToonMaterial(cloneSkeleton(billboardAsset.scene), material),
    [billboardAsset.scene, material],
  )

  return (
    <>
      <group position={[-5.95, -3.82, -0.5]} rotation={[0, 0.48, 0]} scale={5.9}>
        <primitive object={billboard} />
      </group>
      <group position={[2.3, -2, 0]} rotation={[2.3, 3, -2.1]} scale={2.2}>
        <primitive object={astronaut} />
      </group>
      <Preload all />
    </>
  )
}

useGLTF.preload('/models/astronaut.glb')
useGLTF.preload('/models/billboard.glb')
