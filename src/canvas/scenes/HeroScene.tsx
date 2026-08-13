import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { sceneBridge } from '../bridge'

const vertexShader = `
  varying vec3 vNormal;

  #include <common>
  #include <skinning_pars_vertex>

  void main() {
    #include <beginnormal_vertex>
    #include <morphnormal_vertex>
    #include <skinbase_vertex>
    #include <skinnormal_vertex>
    #include <defaultnormal_vertex>
    vNormal = normalize(normalMatrix * transformedNormal);

    #include <begin_vertex>
    #include <morphtarget_vertex>
    #include <skinning_vertex>
    #include <project_vertex>
  }
`

const fragmentShader = `
  uniform vec3 backgroundColor;
  uniform vec3 foregroundColor;
  varying vec3 vNormal;

  void main() {
    float facing = dot(normalize(vNormal), normalize(vec3(0.35, 0.8, 1.0)));
    float tone = step(0.18, facing);
    gl_FragColor = vec4(mix(backgroundColor, foregroundColor, tone), 1.0);
  }
`

type BonePose = Record<string, THREE.Euler>

const driftPose: BonePose = {
  Root: new THREE.Euler(0.08, 0.18, -0.14),
  Waist: new THREE.Euler(0.12, -0.1, 0.2),
  L_Upperarm: new THREE.Euler(-0.45, 0.16, -0.7),
  L_Forearm: new THREE.Euler(-0.5, 0.06, -0.2),
  R_Upperarm: new THREE.Euler(0.3, -0.14, 0.56),
  R_Forearm: new THREE.Euler(-0.32, 0.08, 0.24),
  L_Thigh: new THREE.Euler(-0.34, 0.08, -0.2),
  R_Thigh: new THREE.Euler(0.34, -0.12, 0.24),
  Head: new THREE.Euler(0.08, 0.28, 0.04),
}

const settledPose: BonePose = {
  Root: new THREE.Euler(0, 0, 0),
  Waist: new THREE.Euler(0, 0, 0),
  L_Upperarm: new THREE.Euler(-0.12, 0, -0.16),
  L_Forearm: new THREE.Euler(-0.08, 0, 0),
  R_Upperarm: new THREE.Euler(-0.12, 0, 0.16),
  R_Forearm: new THREE.Euler(-0.08, 0, 0),
  L_Thigh: new THREE.Euler(-0.08, 0, -0.04),
  R_Thigh: new THREE.Euler(-0.08, 0, 0.04),
  Head: new THREE.Euler(0, 0, 0),
}

function isSimplifiedView() {
  return window.matchMedia('(max-width: 700px), (prefers-reduced-motion: reduce)').matches
}

export function HeroScene() {
  const { scene } = useGLTF('/models/astronaut.glb')
  const model = useMemo(() => scene.clone(true), [scene])
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        fragmentShader,
        uniforms: {
          backgroundColor: { value: new THREE.Color() },
          foregroundColor: { value: new THREE.Color() },
        },
        vertexShader,
      }),
    [],
  )
  const root = useRef<THREE.Group>(null)
  const bones = useRef(new Map<string, { bone: THREE.Bone; base: THREE.Quaternion }>())
  const target = useMemo(() => new THREE.Quaternion(), [])
  const isStatic = useRef(false)

  useEffect(() => {
    isStatic.current = isSimplifiedView()

    const updateStaticView = () => {
      isStatic.current = isSimplifiedView()
    }

    window.addEventListener('resize', updateStaticView)

    model.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.material = material
      }

      if (object instanceof THREE.Bone && (driftPose[object.name] || settledPose[object.name])) {
        bones.current.set(object.name, { bone: object, base: object.quaternion.clone() })
      }
    })

    return () => window.removeEventListener('resize', updateStaticView)
  }, [material, model])

  useFrame(() => {
    const tokens = sceneBridge.themeTokens.current

    if (tokens.background && tokens.foreground) {
      material.uniforms.backgroundColor.value.set(tokens.background)
      material.uniforms.foregroundColor.value.set(tokens.foreground)
    }

    const progress = isStatic.current ? 0.82 : sceneBridge.heroProgress.current
    const poseProgress = THREE.MathUtils.smoothstep(progress, 0.08, 0.86)

    if (root.current) {
      root.current.rotation.set(
        THREE.MathUtils.lerp(0.34, 0.02, poseProgress),
        THREE.MathUtils.lerp(-0.62, 0.2, poseProgress),
        THREE.MathUtils.lerp(0.32, 0, poseProgress),
      )
      root.current.position.set(
        THREE.MathUtils.lerp(1.1, 0.85, poseProgress),
        THREE.MathUtils.lerp(-0.16, -0.38, poseProgress),
        0,
      )
    }

    bones.current.forEach(({ bone, base }, name) => {
      const from = driftPose[name]
      const to = settledPose[name]

      if (!from || !to) {
        return
      }

      target.setFromEuler(from).slerp(new THREE.Quaternion().setFromEuler(to), poseProgress)
      bone.quaternion.copy(base).multiply(target)
    })
  })

  return (
    <group ref={root} scale={2.05}>
      <primitive object={model} />
    </group>
  )
}

useGLTF.preload('/models/astronaut.glb')
