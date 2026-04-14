import { useRef, useEffect, useLayoutEffect } from 'react'
import * as THREE from 'three'

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`

const fragmentShader = `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform vec3  uColor;
uniform float uSpeed;
uniform float uScale;
uniform float uRotation;
uniform float uNoiseIntensity;

float noise(vec2 texCoord) {
  vec2 r = (2.71828 * sin(2.71828 * texCoord));
  return fract(r.x * r.y * (1.0 + texCoord.x));
}

vec2 rotateUvs(vec2 uv, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return mat2(c, -s, s, c) * uv;
}

void main() {
  float rnd = noise(gl_FragCoord.xy);
  vec2 uv = rotateUvs(vUv, uRotation);
  vec2 tex = uv * uScale;
  float tOffset = uSpeed * uTime;

  tex.y += 0.03 * sin(6.0 * tex.x - tOffset);
  tex.x += 0.015 * sin(4.0 * tex.y + tOffset * 0.5);

  float pattern = 0.6 + 0.4 * sin(5.0 * (tex.x + tex.y + cos(3.0 * tex.x + 5.0 * tex.y) + 0.02 * tOffset) + sin(20.0 * (tex.x + tex.y - 0.1 * tOffset)));

  vec3 baseColor = uColor * pattern;
  baseColor -= (rnd / 15.0) * uNoiseIntensity;

  gl_FragColor = vec4(baseColor, 1.0);
}
`

export default function LiquidSilk({
  speed = 1.4,
  scale = 1,
  color = '#B3B3B3',
  noiseIntensity = 0.4,
  rotation = 1.2,
}) {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const animationRef = useRef(0)
  const propsRef = useRef({ speed, scale, color, noiseIntensity, rotation })

  useLayoutEffect(() => {
    propsRef.current = { speed, scale, color, noiseIntensity, rotation }
  }, [speed, scale, color, noiseIntensity, rotation])

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    const geometry = new THREE.PlaneGeometry(2, 2)

    let safeColor
    try {
      safeColor = new THREE.Color(color).convertSRGBToLinear()
    } catch {
      safeColor = new THREE.Color('#B3B3B3').convertSRGBToLinear()
    }

    const uniforms = {
      uSpeed: { value: speed },
      uScale: { value: scale },
      uNoiseIntensity: { value: noiseIntensity },
      uColor: { value: safeColor },
      uRotation: { value: rotation },
      uTime: { value: 0 },
    }

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      depthWrite: false,
      depthTest: false,
    })

    scene.add(new THREE.Mesh(geometry, material))

    const clock = new THREE.Clock()

    const resize = () => {
      const w = container.clientWidth
      const h = container.clientHeight
      if (w > 0 && h > 0) {
        renderer.setSize(w, h, false)
      }
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(container)
    resize()

    const render = () => {
      const p = propsRef.current
      uniforms.uTime.value = clock.getElapsedTime()
      uniforms.uSpeed.value = p.speed
      uniforms.uScale.value = p.scale
      uniforms.uNoiseIntensity.value = p.noiseIntensity
      uniforms.uRotation.value = p.rotation
      try { uniforms.uColor.value.set(p.color).convertSRGBToLinear() } catch {}
      renderer.render(scene, camera)
      animationRef.current = requestAnimationFrame(render)
    }
    render()

    return () => {
      cancelAnimationFrame(animationRef.current)
      resizeObserver.disconnect()
      renderer.dispose()
      geometry.dispose()
      material.dispose()
    }
  }, [])

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block', position: 'absolute', top: 0, left: 0 }} />
    </div>
  )
}
