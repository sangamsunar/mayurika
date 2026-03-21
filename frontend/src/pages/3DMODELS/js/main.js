// Import the THREE.js library
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
// Camera controls
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
// GLTF loader
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

// ================= SCENE =================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf2f2f2); // light background

// ================= CAMERA =================
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 1.5, 3);

// ================= RENDERER =================
const renderer = new THREE.WebGLRenderer({
  antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.physicallyCorrectLights = true;

document.getElementById("container3D").appendChild(renderer.domElement);

// ================= MODEL =================
let object;
const objToRender = "eye"; // change if needed

const loader = new GLTFLoader();
loader.load(
  `./models/${objToRender}/scene.gltf`,
  (gltf) => {
    object = gltf.scene;

    // Improve dark material visibility
    object.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.metalness = 0.2;
        child.material.roughness = 0.6;
      }
    });

    scene.add(object);
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  (error) => {
    console.error(error);
  }
);

// ================= LIGHTS =================

// Key light (front)
const keyLight = new THREE.DirectionalLight(0xffffff, 2);
keyLight.position.set(5, 5, 5);
scene.add(keyLight);

// Fill light (soft shadows)
const fillLight = new THREE.DirectionalLight(0xffffff, 1);
fillLight.position.set(-5, 2, 5);
scene.add(fillLight);

// Rim light (outline for black outfit)
const rimLight = new THREE.DirectionalLight(0xffffff, 3);
rimLight.position.set(-5, 2, -5);
scene.add(rimLight);

// Ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
scene.add(ambientLight);

// ================= CONTROLS =================
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

controls.enableRotate = true;
controls.enablePan = true;
controls.enableZoom = true;

controls.rotateSpeed = 0.6;
controls.panSpeed = 0.8;
controls.zoomSpeed = 1.0;

// Optional limits (recommended)
controls.minDistance = 1.5;
controls.maxDistance = 6;
controls.maxPolarAngle = Math.PI / 2;

// ================= ANIMATION LOOP =================
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

// ================= RESIZE =================
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
