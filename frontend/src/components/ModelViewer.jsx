import { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'

const METAL_MATERIALS = {
  gold:     { color: '#FFD700', metalness: 1.0, roughness: 0.15 },
  silver:   { color: '#C0C0C0', metalness: 1.0, roughness: 0.2  },
  roseGold: { color: '#E8A87C', metalness: 1.0, roughness: 0.15 }
}

function AutoFitModel({ url, metal, mouseX, isCard }) {
  const { scene } = useGLTF(`http://localhost:8000${url}`)
  const { camera } = useThree()
  const modelRef = useRef()
  const fitted = useRef(false)

  useEffect(() => {
    const mat = METAL_MATERIALS[metal] || METAL_MATERIALS.gold
    scene.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(mat.color),
          metalness: mat.metalness,
          roughness: mat.roughness,
        })
        child.castShadow = true
        child.receiveShadow = true
      }
    })
  }, [metal, scene])

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

export function ModelViewerCard({ modelUrl, metal = 'gold' }) {
  const [mouseX, setMouseX] = useState(0)
  const containerRef = useRef()

  const handleMouseMove = (e) => {
    const rect = containerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    setMouseX(x)
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMouseX(0)}
    >
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }} style={{ background: 'transparent' }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
        <directionalLight position={[-5, 2, -5]} intensity={0.4} />
        <Environment preset="studio" />
        <AutoFitModel url={modelUrl} metal={metal} mouseX={mouseX} isCard={true} />
        <ContactShadows position={[0, -1.5, 0]} opacity={0.3} scale={10} blur={2.5} />
      </Canvas>
    </div>
  )
}

export function ModelViewerDetail({ modelUrl, metal = 'gold' }) {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        style={{ background: 'transparent', width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
        <directionalLight position={[-5, 2, -5]} intensity={0.4} />
        <directionalLight position={[0, -5, 0]} intensity={0.2} />
        <Environment preset="studio" />
        <AutoFitModel url={modelUrl} metal={metal} mouseX={0} isCard={false} />
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={0.5}
          maxDistance={50}
          enableDamping={true}
          dampingFactor={0.05}
        />
        <ContactShadows position={[0, -1.5, 0]} opacity={0.3} scale={10} blur={2.5} />
      </Canvas>
    </div>
  )
}