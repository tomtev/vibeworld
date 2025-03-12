<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, inject, watch } from 'vue'
import { Vector3 } from 'three'
import type { Material } from 'three'
import type { ChunkData } from '../data/Data'
import { voxelMesher, voxelColliders } from './voxelMesher'
import { ChunkMesh } from './ChunkMesh'

const props = defineProps<{
  chunkKey: string
  depthMaterial: Material
  opaqueMaterial: Material
  transparentMaterial: Material
}>()

// Get data store from provider
const dataStore = inject('voxelDataStore')
const { getChunk, getPhysics, getTexture, getTransparent } = dataStore

// Parse chunk position from key
const chunkPosition = new Vector3().fromArray(
  props.chunkKey.split(':').map((p) => parseInt(p, 10))
)

// Get surrounding chunks data
const getData = () => {
  const data: ChunkData[] = []
  for (let z = -1; z <= 1; z++) {
    for (let y = -1; y <= 1; y++) {
      for (let x = -1; x <= 1; x++) {
        data.push(getChunk(chunkPosition.x + x, chunkPosition.y + y, chunkPosition.z + z).value)
      }
    }
  }
  return data
}

// Get current chunk data
const data = getData()
const chunk = data[13] // Center chunk

// Mesh refs
const opaqueMeshRef = ref<ChunkMesh | null>(null)
const transparentMeshRef = ref<ChunkMesh | null>(null)

// Update meshes when data changes
const updateMeshes = () => {
  const currentData = getData()
  const { opaque, transparent } = voxelMesher(currentData, getTexture, getTransparent)
  
  if (opaqueMeshRef.value) {
    opaqueMeshRef.value.update(opaque)
  }
  
  if (transparentMeshRef.value) {
    transparentMeshRef.value.update(transparent)
  }
}

// Setup physics if available
let colliders = new Map()
const setupPhysics = () => {
  if (!getPhysics) return
  
  const { world, rapier } = getPhysics()
  const currentData = getData()
  const oldColliders = new Map(colliders)
  colliders = new Map()
  
  voxelColliders(currentData).forEach(({ position, size }) => {
    const key = `${position[0]}:${position[1]}:${position[2]}:${size[0]}:${size[1]}:${size[2]}`
    let collider = oldColliders.get(key)
    
    if (!collider) {
      collider = world.createCollider(
        rapier.ColliderDesc
          .cuboid(
            size[0] * 0.5,
            size[1] * 0.5,
            size[2] * 0.5
          )
          .setTranslation(
            chunk.position.x + position[0] + size[0] * 0.5,
            chunk.position.y + position[1] + size[1] * 0.5,
            chunk.position.z + position[2] + size[2] * 0.5
          )
      )
    } else {
      oldColliders.delete(key)
    }
    
    colliders.set(key, collider)
  })
  
  // Remove old colliders
  oldColliders.forEach((collider) => {
    world.removeCollider(collider, true)
  })
}

// Cleanup physics on unmount
const cleanupPhysics = () => {
  if (!getPhysics) return
  
  const { world } = getPhysics()
  colliders.forEach((collider) => {
    world.removeCollider(collider, true)
  })
}

// Setup on mount
onMounted(() => {
  updateMeshes()
  setupPhysics()
})

// Cleanup on unmount
onBeforeUnmount(() => {
  cleanupPhysics()
})

// Watch for data changes
watch(() => getData(), () => {
  updateMeshes()
  setupPhysics()
}, { deep: true })
</script>

<template>
  <TresGroup>
    <TresCustom
      v-if="chunk"
      :is="ChunkMesh"
      ref="opaqueMeshRef"
      :custom-depth-material="depthMaterial"
      :material="opaqueMaterial"
      :position="chunk.position"
      cast-shadow
      receive-shadow
    />
    <TresCustom
      v-if="chunk"
      :is="ChunkMesh"
      ref="transparentMeshRef"
      :custom-depth-material="depthMaterial"
      :material="transparentMaterial"
      :position="chunk.position"
      receive-shadow
    />
  </TresGroup>
</template>
