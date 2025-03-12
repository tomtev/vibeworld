<script setup lang="ts">
import { provide } from 'vue'
import { createDataStore } from './Data'
import type { VoxelFace } from './Data'

const props = defineProps<{
  generator?: (x: number, y: number, z: number) => number
  getPhysics?: () => { world: unknown; rapier: unknown }
  getTexture?: (voxel: number, face: VoxelFace, isTop: boolean) => number
  getTransparent?: (voxel: number) => boolean
}>()

// Create the data store
const dataStore = createDataStore(
  props.generator, 
  props.getPhysics, 
  props.getTexture, 
  props.getTransparent
)

// Provide the data store to all child components
provide('voxelDataStore', dataStore)
// Also provide it with the key used in useVoxels
provide('voxelData', dataStore)

// Export the component
defineOptions({
  name: 'DataProvider'
})
</script>

<template>
  <slot></slot>
</template>
