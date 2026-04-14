import { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'

// Realistic gold purity colors — warm, rich, not olive/yellow-green
const GOLD_PURITY_COLORS = {
  '24K': '#F0BC38',  // 24K — more saturated, deeper warm gold
  '23K': '#F5C542',  // 23K — lighter, brighter tone
  '22K': '#EAB030',  // slightly deeper warm gold
  '18K': '#E8A820',  // 18K — still clearly gold, warm but not orange
}

// Realistic metal definitions
// Key insight: polished jewellery gold has roughness ~0.05–0.1, not 0.15+
// envMapIntensity 3–5 makes the metal actually look like it's reflecting light
const METAL_MATERIALS = {
  gold: (purity) => ({
    color: GOLD_PURITY_COLORS[purity] || '#F5C542',
    metalness: 1.0,
    roughness: purity === '24K' ? 0.05 : purity === '23K' ? 0.06 : purity === '22K' ? 0.07 : 0.08,
    envMapIntensity: 4.0,
  }),
  silver: () => ({
    color: '#E8E8E8',   // bright cool silver, not dark grey
    metalness: 1.0,
    roughness: 0.08,
    envMapIntensity: 3.5,
  }),
  roseGold: () => ({
    color: '#E8956D',   // warm peachy-pink, not orange
    metalness: 1.0,
    roughness: 0.07,
    envMapIntensity: 3.5,
  }),
}

function getMaterial(metal, purity) {
  const fn = METAL_MATERIALS[metal] || METAL_MATERIALS.gold
  return fn(purity)
}

function AutoFitModel({ url, metal, purity, mouseX, isCard }) {
  const { scene } = useGLTF(`http://localhost:8000${url}`)
  const { camera } = useThree()
  const modelRef = useRef()
  const fitted = useRef(false)

  useEffect(() => {
    const mat = getMaterial(metal, purity)
    scene.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(mat.color),
          metalness: mat.metalness,
          roughness: mat.roughness,
          envMapIntensity: mat.envMapIntensity,
        })
        child.castShadow = true
        child.receiveShadow = true
      }
    })
  }, [metal, purity, scene])

  useEffect(() => {
    if (fitted.current) return
    fitted.current = true
    const box = new THREE.Box3().setFromObject(scene)
    const size = new THREE.Vector3()
    const center = new THREE.Vector3()
    box.getSize(size)
    box.getCenter(center)
    scene.position.sub(center)
    const maxDim = Math.max(size.x, size.y, size.z)
    const fov = camera.fov * (Math.PI / 180)
    const distance = Math.abs(maxDim / Math.sin(fov / 2)) * 0.75
    camera.position.set(0, 0, distance)
    camera.near = distance / 100
    camera.far = distance * 100
    camera.updateProjectionMatrix()
  }, [scene, camera])

  useFrame(() => {
    if (isCard && modelRef.current) {
      const target = (mouseX || 0) * Math.PI
      modelRef.current.rotation.y += (target - modelRef.current.rotation.y) * 0.08
    }
  })

  return <primitive ref={modelRef} object={scene} />
}

// Lighting designed for jewellery: bright fill lights prevent dark shadows,
// 'warehouse' env gives realistic industrial reflections on polished metal
function JewelleryLights() {
  return (
    <>
      {/* Soft overall fill — prevents deep black shadows in ring gaps */}
      <ambientLight intensity={1.2} />
      {/* Key light — front-top, warm */}
      <directionalLight position={[2, 4, 6]} intensity={1.8} color="#FFF8F0" castShadow />
      {/* Fill light — front-left, neutral */}
      <directionalLight position={[-4, 2, 4]} intensity={1.2} color="#FFFFFF" />
      {/* Rim light — back-right, adds sparkle to edges */}
      <directionalLight position={[3, -1, -4]} intensity={0.8} color="#FFF5E0" />
      {/* Bottom bounce — lifts shadows under ring */}
      <directionalLight position={[0, -4, 3]} intensity={0.6} color="#FFFFFF" />
      {/* Left fill */}
      <directionalLight position={[-3, 3, 2]} intensity={0.7} color="#FFFFFF" />
    </>
  )
}

export function ModelViewerCard({ modelUrl, metal = 'gold', purity = '24K' }) {
  const [mouseX, setMouseX] = useState(0)
  const containerRef = useRef()

  const handleMouseMove = (e) => {
    const rect = containerRef.current.getBoundingClientRect()
    setMouseX(((e.clientX - rect.left) / rect.width) * 2 - 1)
  }

  return (
    <div ref={containerRef} className="w-full h-full" onMouseMove={handleMouseMove} onMouseLeave={() => setMouseX(0)}>
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }} style={{ background: 'transparent' }}>
        <JewelleryLights />
        {/* 'warehouse' gives clean bright reflections on metal — better than 'studio' for gold */}
        <Environment preset="warehouse" />
        <AutoFitModel url={modelUrl} metal={metal} purity={purity} mouseX={mouseX} isCard={true} />
        <ContactShadows position={[0, -1.5, 0]} opacity={0.2} scale={10} blur={2.5} />
      </Canvas>
    </div>
  )
}

export function ModelViewerDetail({ modelUrl, metal = 'gold', purity = '24K' }) {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        style={{ background: 'transparent', width: '100%', height: '100%' }}
      >
        <JewelleryLights />
        <Environment preset="warehouse" />
        <AutoFitModel url={modelUrl} metal={metal} purity={purity} mouseX={0} isCard={false} />
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={0.5}
          maxDistance={50}
          enableDamping={true}
          dampingFactor={0.05}
        />
        <ContactShadows position={[0, -1.5, 0]} opacity={0.2} scale={10} blur={2.5} />
      </Canvas>
    </div>
  )
}