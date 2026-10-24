<template>
  <div class="tour-viewer">
    <div ref="container" class="canvas-container"></div>
    
    <div class="controls">
      <button @click="prevScene" class="nav-btn" :disabled="currentSceneIndex === 0">
        ← Previous
      </button>
      <span class="scene-indicator">
        {{ currentSceneIndex + 1 }} / {{ scenes.length }}
      </span>
      <button @click="nextScene" class="nav-btn" :disabled="currentSceneIndex === scenes.length - 1">
        Next →
      </button>
    </div>
    
    <div class="scene-info">
      <h3>{{ currentScene?.name }}</h3>
    </div>
    
    <div v-if="currentHotspots.length > 0" class="hotspots">
      <div 
        v-for="hotspot in currentHotspots" 
        :key="hotspot.id"
        class="hotspot"
        :style="{ left: hotspot.x + '%', top: hotspot.y + '%' }"
        @click="showHotspotInfo(hotspot)"
      >
        <div class="hotspot-marker">i</div>
        <div class="hotspot-tooltip">{{ hotspot.label }}</div>
      </div>
    </div>
    
    <div v-if="selectedHotspot" class="hotspot-modal" @click="selectedHotspot = null">
      <div class="modal-content" @click.stop>
        <h3>{{ selectedHotspot.label }}</h3>
        <p>{{ selectedHotspot.description }}</p>
        <button @click="selectedHotspot = null" class="close-btn">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const props = defineProps<{ propertyId: string }>()
const container = ref<HTMLElement | null>(null)
const { data: tour } = await useFetch<any>(`/api/properties/${props.propertyId}/tours`)

const scenes = computed(() => (tour.value?.scenes as any[]) || [])
const currentSceneIndex = ref(0)
const currentScene = computed(() => scenes.value[currentSceneIndex.value])
const currentHotspots = computed(() => currentScene.value?.hotspots || [])
const selectedHotspot = ref<any>(null)

let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let controls: OrbitControls
let currentModel: THREE.Group

onMounted(() => {
  initThreeJS()
  loadScene(currentScene.value)
})

onUnmounted(() => {
  if (renderer) {
    renderer.dispose()
  }
})

const initThreeJS = () => {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xf0f0f0)
  
  const el = container.value!
  camera = new THREE.PerspectiveCamera(
    75,
    el.clientWidth / el.clientHeight,
    0.1,
    1000
  )
  camera.position.set(0, 2, 5)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(el.clientWidth, el.clientHeight)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.shadowMap.enabled = true
  el.appendChild(renderer.domElement)
  
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.maxPolarAngle = Math.PI / 2
  
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
  scene.add(ambientLight)
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(5, 10, 7.5)
  directionalLight.castShadow = true
  scene.add(directionalLight)
  
  const gridHelper = new THREE.GridHelper(20, 20)
  scene.add(gridHelper)
  
  window.addEventListener('resize', onWindowResize)
  animate()
}

const loadScene = (sceneData: any) => {
  if (currentModel) {
    scene.remove(currentModel)
  }
  
  const loader = new GLTFLoader()
  loader.load(sceneData.modelUrl, (gltf: any) => {
    currentModel = gltf.scene
    currentModel.position.set(
      sceneData.position?.x || 0,
      sceneData.position?.y || 0,
      sceneData.position?.z || 0
    )
    currentModel.rotation.set(
      sceneData.rotation?.x || 0,
      sceneData.rotation?.y || 0,
      sceneData.rotation?.z || 0
    )
    scene.add(currentModel)
  })
}

const animate = () => {
  requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
}

const onWindowResize = () => {
  if (!container.value) return
  camera.aspect = container.value.clientWidth / container.value.clientHeight
  camera.updateProjectionMatrix()
  renderer.setSize(container.value.clientWidth, container.value.clientHeight)
}

const nextScene = () => {
  if (currentSceneIndex.value < scenes.value.length - 1) {
    currentSceneIndex.value++
    loadScene(currentScene.value)
  }
}

const prevScene = () => {
  if (currentSceneIndex.value > 0) {
    currentSceneIndex.value--
    loadScene(currentScene.value)
  }
}

const showHotspotInfo = (hotspot: any) => {
  selectedHotspot.value = hotspot
}
</script>

<style scoped>
.tour-viewer {
  position: relative;
  width: 100%;
  height: 600px;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
}

.canvas-container {
  width: 100%;
  height: 100%;
}

.controls {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(0, 0, 0, 0.7);
  padding: 12px 20px;
  border-radius: 24px;
}

.nav-btn {
  padding: 8px 16px;
  background: white;
  border: none;
  border-radius: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.nav-btn:hover:not(:disabled) {
  background: #f3f4f6;
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.scene-indicator {
  color: white;
  font-weight: 600;
}

.scene-info {
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.7);
  padding: 12px 20px;
  border-radius: 8px;
}

.scene-info h3 {
  margin: 0;
  color: white;
  font-size: 16px;
}

.hotspots {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.hotspot {
  position: absolute;
  pointer-events: auto;
  cursor: pointer;
}

.hotspot-marker {
  width: 32px;
  height: 32px;
  background: #6366f1;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 14px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.hotspot-tooltip {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.2s;
}

.hotspot:hover .hotspot-tooltip {
  opacity: 1;
}

.hotspot-modal {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: white;
  padding: 24px;
  border-radius: 12px;
  max-width: 400px;
}

.modal-content h3 {
  margin: 0 0 12px 0;
}

.modal-content p {
  margin: 0 0 16px 0;
  color: #6b7280;
}

.close-btn {
  padding: 8px 16px;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
</style>
