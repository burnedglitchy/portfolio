import { useFrame } from '@react-three/fiber'
import { useMemo } from 'react'
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
    vec3 lightDirection = normalize(vec3(0.35, 0.8, 1.0));
    float tone = step(0.18, dot(normalize(vNormal), lightDirection));
    gl_FragColor = vec4(mix(backgroundColor, foregroundColor, tone), 1.0);
  }
`

export function useTwoToneToonMaterial() {
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

  useFrame(() => {
    const { background, foreground } = sceneBridge.themeTokens.current

    if (background && foreground) {
      material.uniforms.backgroundColor.value.set(background)
      material.uniforms.foregroundColor.value.set(foreground)
    }
  })

  return material
}
