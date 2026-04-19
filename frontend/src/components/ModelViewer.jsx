import { useRef, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'

// ── Metal colour palette ───────────────────────────────────────────────────────
const GOLD_COLORS = {
  '24K': '#F0BC38',
  '23K': '#F5C542',
  '22K': '#EAB030',
  '18K': '#E8A820',
}

const METAL_MATERIALS = {
  gold: (purity) => ({
    color: GOLD_COLORS[purity] || '#F5C542',
    metalness: 1.0,
    roughness: purity === '24K' ? 0.05 : purity === '23K' ? 0.06 : purity === '22K' ? 0.07 : 0.08,
    envMapIntensity: 4.0,
  }),
  silver: () => ({
    color: '#E8E8E8',
    metalness: 1.0,
    roughness: 0.08,
    envMapIntensity: 3.5,
  }),
  roseGold: () => ({
    color: '#E8956D',
    metalness: 1.0,
    roughness: 0.07,
    envMapIntensity: 3.5,
  }),
}

function getMetalProps(metal, purity) {
  const fn = METAL_MATERIALS[metal] || METAL_MATERIALS.gold
  return fn(purity)
}

// ── Stone / gem detection ─────────────────────────────────────────────────────
// Keywords that appear in mesh or material names inside GLB files for stones
const STONE_KEYWORDS = [
  'stone', 'gem', 'diamond', 'ruby', 'emerald', 'sapphire',
  'pearl', 'crystal', 'jewel', 'bead', 'cubic', 'zirconia',
  'topaz', 'opal', 'amethyst', 'garnet', 'setting_stone',
  // common artist naming conventions for diamond/gem meshes
  'dmesh', 'dia', 'brillant', 'brilliant', 'facet',
]

function isStoneMesh(meshName, matName, originalMaterial) {
  const n = (meshName || '').toLowerCase()
  const m = (matName  || '').toLowerCase()

  // 1. Name-based check (most reliable when the artist named things correctly)
  if (STONE_KEYWORDS.some(k => n.includes(k) || m.includes(k))) return true

  // 2. Material property check — genuine metal has metalness ≥ 0.8
  //    Stones are typically non-metallic: low metalness, sometimes transparent
  if (originalMaterial) {
    const metalness = originalMaterial.metalness ?? 1

    if (metalness < 0.4) return true   // clearly non-metallic → stone / resin / enamel

    // transparent = true means alphaMode BLEND in glTF — diamonds use texture-driven alpha,
    // so opacity stays 1.0 even though transparent is true. Check transparent alone.
    if (originalMaterial.transparent) return true
  }

  return false
}

// ── Core model component ──────────────────────────────────────────────────────
function AutoFitModel({ url, metal, purity, mouseX, isCard }) {
  const { scene } = useGLTF(`http://localhost:8000${url}`)
  const { camera } = useThree()
  const modelRef  = useRef()
  const fitted    = useRef(false)
  const originals = useRef(null)   // Map<uuid, { material, name, matName }>

  // ── Step 1: store original materials exactly once per scene load ────────────
  useEffect(() => {
    originals.current = new Map()
    scene.traverse((child) => {
      if (child.isMesh) {
        originals.current.set(child.uuid, {
          material: child.material.clone(),  // deep-clone to protect the original
          name:    child.name || '',
          matName: child.material?.name || '',
        })
      }
    })
  }, [scene])

  // ── Step 2: apply metal colour — skip stone/gem meshes ─────────────────────
  useEffect(() => {
    if (!originals.current) return
    const props = getMetalProps(metal, purity)

    scene.traverse((child) => {
      if (!child.isMesh) return
      const orig = originals.current.get(child.uuid)
      if (!orig) return

      if (isStoneMesh(orig.name, orig.matName, orig.material)) {
        // Restore the original stone / gem material untouched
        child.material = orig.material.clone()
      } else {
        // Replace with selected metal material
        child.material = new THREE.MeshStandardMaterial({
          color:            new THREE.Color(props.color),
          metalness:        props.metalness,
          roughness:        props.roughness,
          envMapIntensity:  props.envMapIntensity,
        })
      }

      child.castShadow    = true
      child.receiveShadow = true
    })
  }, [metal, purity, scene])

  // ── Auto-fit camera to model bounds ────────────────────────────────────────
  useEffect(() => {
    if (fitted.current) return
    fitted.current = true
    const box    = new THREE.Box3().setFromObject(scene)
    const size   = new THREE.Vector3()
    const center = new THREE.Vector3()
    box.getSize(size)
    box.getCenter(center)
    scene.position.sub(center)
    const maxDim   = Math.max(size.x, size.y, size.z)
    const fov      = camera.fov * (Math.PI / 180)
    const distance = Math.abs(maxDim / Math.sin(fov / 2)) * 0.75
    camera.position.set(0, 0, distance)
    camera.near = distance / 100
    camera.far  = distance * 100
    camera.updateProjectionMatrix()
  }, [scene, camera])

  // ── Lazy rotation on card hover ─────────────────────────────────────────────
  useFrame(() => {
    if (isCard && modelRef.current) {
      const target = (mouseX || 0) * Math.PI
      modelRef.current.rotation.y += (target - modelRef.current.rotation.y) * 0.08
    }
  })

  return <primitive ref={modelRef} object={scene} />
}

// ── Lighting ──────────────────────────────────────────────────────────────────
function JewelleryLights() {
  return (
    <>
      <ambientLight intensity={1.2} />
      <directionalLight position={[2,  4,  6]} intensity={1.8} color="#FFF8F0" castShadow />
      <directionalLight position={[-4, 2,  4]} intensity={1.2} color="#FFFFFF" />
      <directionalLight position={[3, -1, -4]} intensity={0.8} color="#FFF5E0" />
      <directionalLight position={[0, -4,  3]} intensity={0.6} color="#FFFFFF" />
      <directionalLight position={[-3, 3,  2]} intensity={0.7} color="#FFFFFF" />
    </>
  )
}

// ── Public components ─────────────────────────────────────────────────────────
export function ModelViewerCard({ modelUrl, metal = 'gold', purity = '24K' }) {
  const containerRef = useRef()
  const mouseXRef    = useRef(0)

  const handleMouseMove = (e) => {
    const rect = containerRef.current.getBoundingClientRect()
    mouseXRef.current = ((e.clientX - rect.left) / rect.width) * 2 - 1
  }

  return (
    <div ref={containerRef} className="w-full h-full"
      onMouseMove={handleMouseMove} onMouseLeave={() => { mouseXRef.current = 0 }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }} style={{ background: 'transparent' }}>
        <JewelleryLights />
        <Environment preset="warehouse" />
        <AutoFitModel url={modelUrl} metal={metal} purity={purity}
          mouseX={mouseXRef.current} isCard={true} />
        <ContactShadows position={[0, -1.5, 0]} opacity={0.2} scale={10} blur={2.5} />
      </Canvas>
    </div>
  )
}

export function ModelViewerDetail({ modelUrl, metal = 'gold', purity = '24K' }) {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}
        style={{ background: 'transparent', width: '100%', height: '100%' }}>
        <JewelleryLights />
        <Environment preset="warehouse" />
        <AutoFitModel url={modelUrl} metal={metal} purity={purity}
          mouseX={0} isCard={false} />
        <OrbitControls enableZoom enablePan={false}
          minDistance={0.5} maxDistance={50}
          enableDamping dampingFactor={0.05} />
        <ContactShadows position={[0, -1.5, 0]} opacity={0.2} scale={10} blur={2.5} />
      </Canvas>
    </div>
  )
}
