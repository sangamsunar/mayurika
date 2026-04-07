import { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'

const METAL_MATERIALS = {
  gold: { color: '#FFD700', metalness: 1.0, roughness: 0.15 },
  silver: { color: '#C0C0C0', metalness: 1.0, roughness: 0.2 },
  roseGold: { color: '#E8A87C', metalness: 1.0, roughness: 0.15 }
}

// Auto fits camera to model bounding box
function CameraFit({ scene }) {
  const { camera } = useThree()

  useEffect(() => {
    if (!scene) return

    const box = new THREE.Box3().setFromObject(scene)
    const size = new THREE.Vector3()
    const center = new THREE.Vector3()
    box.getSize(size)
    box.getCenter(center)

    // Move model to center
    scene.position.sub(center)

    // Calculate camera distance based on model size
    const maxDim = Math.max(size.x, size.y, size.z)
    const fov = camera.fov * (Math.PI / 180)
    const cameraDistance = Math.abs(maxDim / Math.sin(fov / 2)) * 0.75

    camera.position.set(0, 0, cameraDistance)
    camera.near = cameraDistance / 100
    camera.far = cameraDistance * 100
    camera.updateProjectionMatrix()
  }, [scene, camera])

  return null
}

// Card model — rotates based on mouse X position on card
function CardModel({ scene, metal, mouseX }) {
  const modelRef = useRef()

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

  useFrame(() => {
    if (modelRef.current) {
      // mouseX is -1 to 1, map to -PI to PI rotation
      const targetRotation = mouseX * Math.PI
      // Smooth lerp towards target
      modelRef.current.rotation.y += (targetRotation - modelRef.current.rotation.y) * 0.08
    }
  })

  return <primitive ref={modelRef} object={scene} />
}

// Detail model — full orbit controls
function DetailModel({ scene, metal }) {
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

  return <primitive object={scene} />
}

// Card Viewer — hover left/right to rotate
export function ModelViewerCard({ modelUrl, metal = 'gold' }) {
  const { scene } = useGLTF(`http://localhost:8000${modelUrl}`)
  const [mouseX, setMouseX] = useState(0)
  const containerRef = useRef()

  const handleMouseMove = (e) => {
    const rect = containerRef.current.getBoundingClientRect()
    // Normalize mouse X to -1 (left) to 1 (right)
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    setMouseX(x)
  }

  const handleMouseLeave = () => {
    setMouseX(0) // reset to front when mouse leaves
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
        <directionalLight position={[-5, 2, -5]} intensity={0.4} />
        <Environment preset="studio" />
        <CameraFit scene={scene} />
        <CardModel scene={scene} metal={metal} mouseX={mouseX} />
        <ContactShadows
          position={[0, -1.5, 0]}
          opacity={0.3}
          scale={10}
          blur={2.5}
        />
      </Canvas>
    </div>
  )
}

// Detail Viewer — full orbit controls
export function ModelViewerDetail({ modelUrl, metal = 'gold' }) {
  const { scene } = useGLTF(`http://localhost:8000${modelUrl}`)

  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      style={{ background: 'transparent', width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
      <directionalLight position={[-5, 2, -5]} intensity={0.4} />
      <directionalLight position={[0, -5, 0]} intensity={0.2} />
      <Environment preset="studio" />
      <CameraFit scene={scene} />
      <DetailModel scene={scene} metal={metal} />
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        minDistance={1}
        maxDistance={20}
        enableDamping={true}
        dampingFactor={0.05}
      />
      <ContactShadows
        position={[0, -1.5, 0]}
        opacity={0.3}
        scale={10}
        blur={2.5}
      />
    </Canvas>
  )
}