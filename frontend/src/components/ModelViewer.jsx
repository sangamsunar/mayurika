import { useRef, useEffect, useState, Suspense } from 'react'
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
}

function getMetalProps(metal, purity) {
  const fn = METAL_MATERIALS[metal] || METAL_MATERIALS.gold
  return fn(purity)
}

// ── Stone / gem detection ─────────────────────────────────────────────────────
const STONE_KEYWORDS = [
  'stone', 'gem', 'diamond', 'ruby', 'emerald', 'sapphire',
  'pearl', 'crystal', 'jewel', 'bead', 'cubic', 'zirconia',
  'topaz', 'opal', 'amethyst', 'garnet', 'setting_stone',
  'dmesh', 'dia', 'brillant', 'brilliant', 'facet',
]

function isStoneMesh(meshName, matName, originalMaterial) {
  const n = (meshName || '').toLowerCase()
  const m = (matName  || '').toLowerCase()
  // Keyword-based detection is the most reliable heuristic
  if (STONE_KEYWORDS.some(k => n.includes(k) || m.includes(k))) return true
  // Only use transparency as a secondary signal — GLTF models default to
  // metalness=0 for *all* surfaces (including metal parts), so checking
  // metalness here would incorrectly classify most ring bodies as "stones".
  if (originalMaterial?.transparent) return true
  return false
}

// Resolve to a full URL — supports blob: URLs (admin preview) and server paths
function resolveUrl(url) {
  if (!url) return ''
  if (url.startsWith('blob:') || url.startsWith('http')) return url
  return `http://localhost:8000${url}`
}

// ── Core model component ──────────────────────────────────────────────────────
// mouseXRef: a React ref object (not .current) so useFrame always reads the live value
function AutoFitModel({ url, metal, purity, mouseXRef, isCard, onReady }) {
  const { scene } = useGLTF(resolveUrl(url))
  const { camera } = useThree()
  const modelRef   = useRef()
  const fitted     = useRef(false)
  const originals  = useRef(null)
  const autoAngle  = useRef(0)
  const notified   = useRef(false)

  useEffect(() => {
    // Build originals map AND apply materials in the same effect to avoid the
    // race condition where the material effect fires before originals are set.
    const map = new Map()
    scene.traverse((child) => {
      if (child.isMesh) {
        map.set(child.uuid, {
          material: child.material.clone(),
          name:    child.name || '',
          matName: child.material?.name || '',
        })
      }
    })
    originals.current = map

    const props = getMetalProps(metal, purity)
    scene.traverse((child) => {
      if (!child.isMesh) return
      const orig = map.get(child.uuid)
      if (!orig) return
      if (isStoneMesh(orig.name, orig.matName, orig.material)) {
        child.material = orig.material.clone()
      } else {
        child.material = new THREE.MeshStandardMaterial({
          color:           new THREE.Color(props.color),
          metalness:       props.metalness,
          roughness:       props.roughness,
          envMapIntensity: props.envMapIntensity,
        })
      }
      child.castShadow    = true
      child.receiveShadow = true
    })
  }, [scene, metal, purity])

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

  useFrame((_, delta) => {
    if (!isCard || !modelRef.current) return
    const mx = mouseXRef?.current ?? 0

    if (Math.abs(mx) < 0.05) {
      // Auto-rotate slowly when mouse is away
      autoAngle.current += delta * 0.45
      modelRef.current.rotation.y = autoAngle.current
    } else {
      // Follow mouse with smooth lerp
      const target = mx * Math.PI * 0.8
      modelRef.current.rotation.y += (target - modelRef.current.rotation.y) * 0.08
      autoAngle.current = modelRef.current.rotation.y
    }

    // Fire onReady once after first frame renders
    if (!notified.current && onReady) {
      notified.current = true
      onReady()
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

// ── Lazy card viewer — Canvas only mounts once the card enters the viewport ───
export function LazyModelViewerCard({ modelUrl, metal = 'gold', purity = '24K' }) {
  const [visible, setVisible]   = useState(false)
  const [ready, setReady]       = useState(false)
  const containerRef = useRef()
  const mouseXRef    = useRef(0)   // pass the REF OBJECT to AutoFitModel, not .current

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const handleMouseMove = (e) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    mouseXRef.current = ((e.clientX - rect.left) / rect.width) * 2 - 1
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { mouseXRef.current = 0 }}
    >
      {visible ? (
        <>
          {/* Spinner shown until first frame renders */}
          {!ready && (
            <div className="absolute inset-0 flex items-center justify-center bg-surface-2 z-10">
              <div style={{
                width: 28, height: 28,
                border: '2px solid rgba(201,169,110,0.15)',
                borderTopColor: '#C9A96E',
                borderRadius: '50%',
                animation: 'spin 0.7s linear infinite',
              }} />
            </div>
          )}
          {/* Canvas fades in after model is ready */}
          <div style={{
            width: '100%', height: '100%',
            opacity: ready ? 1 : 0,
            transition: 'opacity 0.5s ease',
          }}>
            <Canvas
              camera={{ position: [0, 0, 5], fov: 45 }}
              style={{ background: 'transparent' }}
              dpr={[1, 1.5]}
              performance={{ min: 0.5 }}
              gl={{ powerPreference: 'high-performance' }}
            >
              <JewelleryLights />
              <Environment preset="warehouse" />
              <Suspense fallback={null}>
                <AutoFitModel
                  url={modelUrl}
                  metal={metal}
                  purity={purity}
                  mouseXRef={mouseXRef}
                  isCard={true}
                  onReady={() => setReady(true)}
                />
              </Suspense>
              <ContactShadows position={[0, -1.5, 0]} opacity={0.2} scale={10} blur={2.5} />
            </Canvas>
          </div>
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-surface-2">
          <div style={{
            width: 28, height: 28,
            border: '2px solid rgba(201,169,110,0.15)',
            borderTopColor: '#C9A96E',
            borderRadius: '50%',
            animation: 'spin 0.7s linear infinite',
          }} />
        </div>
      )}
    </div>
  )
}

// ── Original card viewer (kept for reference) — use LazyModelViewerCard instead
export function ModelViewerCard({ modelUrl, metal = 'gold', purity = '24K' }) {
  const containerRef = useRef()
  const mouseXRef    = useRef(0)

  const handleMouseMove = (e) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    mouseXRef.current = ((e.clientX - rect.left) / rect.width) * 2 - 1
  }

  return (
    <div ref={containerRef} className="w-full h-full"
      onMouseMove={handleMouseMove} onMouseLeave={() => { mouseXRef.current = 0 }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }} style={{ background: 'transparent' }} dpr={[1, 1.5]}
        performance={{ min: 0.5 }} gl={{ powerPreference: 'high-performance' }}>
        <JewelleryLights />
        <Environment preset="warehouse" />
        <Suspense fallback={null}>
          <AutoFitModel url={modelUrl} metal={metal} purity={purity}
            mouseXRef={mouseXRef} isCard={true} />
        </Suspense>
        <ContactShadows position={[0, -1.5, 0]} opacity={0.2} scale={10} blur={2.5} />
      </Canvas>
    </div>
  )
}

// ── Detail viewer (product page) ──────────────────────────────────────────────
export function ModelViewerDetail({ modelUrl, metal = 'gold', purity = '24K' }) {
  const dummyRef = useRef(0)
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}
        style={{ background: 'transparent', width: '100%', height: '100%' }}
        performance={{ min: 0.5 }} gl={{ powerPreference: 'high-performance' }}>
        <JewelleryLights />
        <Environment preset="warehouse" />
        <Suspense fallback={null}>
          <AutoFitModel url={modelUrl} metal={metal} purity={purity}
            mouseXRef={dummyRef} isCard={false} />
        </Suspense>
        <OrbitControls enableZoom enablePan={false}
          minDistance={0.5} maxDistance={50}
          enableDamping dampingFactor={0.05} />
        <ContactShadows position={[0, -1.5, 0]} opacity={0.2} scale={10} blur={2.5} />
      </Canvas>
    </div>
  )
}
