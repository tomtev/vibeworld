<script setup lang="ts">
import { provide, computed } from 'vue'
import { useRenderLoop } from '@tresjs/core'
import { Box3, Vector3 } from 'three'
import type { DataArrayTexture, Texture } from 'three'
import { VoxelChunk } from './chunk/VoxelChunk.vue'
import { useMaterials } from './chunk/useMaterials'
import { DataProvider } from './data/DataProvider.vue'
import { chunkSize, useData } from './data/Data'
import type { VoxelFace } from './data/Data'
import type { VoxelsApi } from './types'

const props = defineProps<{
  atlas?: DataArrayTexture | Texture | null
  normalAtlas?: DataArrayTexture | Texture | null
  occlusionRoughnessMetalnessAtlas?: DataArrayTexture | Texture | null
  bounds?: Box3
  followCamera?: boolean
  metalness?: number
  roughness?: number
  generator?: (x: number, y: number, z: number) => number
  getPhysics?: () => { world: unknown; rapier: unknown }
  getTexture?: (voxel: number, face: VoxelFace, isTop: boolean) => number
  getTransparent?: (voxel: number) => boolean
  shaders?: {
    vertexShader?: string
    fragmentShader?: string
  }
}>()

// Set default bounds if not provided
const effectiveBounds = computed(() => 
  props.bounds || new Box3(new Vector3(-5, 0, -5), new Vector3(5, 2, 5))
)

// Create data store through the provider
const dataStore = useData()
const { loaded, addEventListener, removeEventListener, clearChunks, exportChunks, importChunks, loadChunks, getVoxel, setVoxel } = dataStore

// Setup materials
const { depthMaterial, opaqueMaterial, transparentMaterial } = useMaterials(
  props.atlas, 
  props.normalAtlas, 
  props.occlusionRoughnessMetalnessAtlas, 
  props.shaders
)

// Provide data context to child components
provide('voxelData', dataStore)

// Camera following logic
const aux = new Vector3()

// Animation loop (equivalent to useFrame in R3F)
useRenderLoop(({ camera }) => {
  if (props.followCamera) {
    aux.set(camera.position.x, 0, camera.position.z).divideScalar(chunkSize).floor()
  } else {
    aux.set(0, 0, 0)
  }
  
  const origin = loaded.value?.origin
  if (!origin || !origin.equals(aux)) {
    loadChunks(aux, effectiveBounds.value)
  }
})

// Create API to expose
const api: VoxelsApi = {
  addEventListener,
  removeEventListener,
  clearChunks,
  exportChunks,
  importChunks,
  getMaterials: () => ({
    opaque: opaqueMaterial.value,
    transparent: transparentMaterial.value,
  }),
  getVoxel,
  setVoxel,
}

// Expose API (equivalent to React's useImperativeHandle)
defineExpose(api)
</script>

<template>
  <DataProvider 
    :generator="generator" 
    :get-physics="getPhysics" 
    :get-texture="getTexture" 
    :get-transparent="getTransparent"
  >
    <TresGroup>
      <VoxelChunk
        v-for="key in loaded?.chunks || []"
        :key="key"
        :chunk-key="key"
        :depth-material="depthMaterial"
        :opaque-material="opaqueMaterial"
        :transparent-material="transparentMaterial"
      />
      <slot></slot>
    </TresGroup>
  </DataProvider>
</template>
