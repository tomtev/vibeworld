# TresJS Voxels

A voxel engine for TresJS (Vue 3) based on the original r3f-voxels package.

## Features

- Declarative voxel world creation using Vue components
- Chunk-based rendering for performance
- Customizable voxel generation
- Texture mapping
- Transparency support
- Physics integration (optional)
- Camera following

## Installation

```bash
# If using npm
npm install three @tresjs/core

# If using yarn
yarn add three @tresjs/core

# If using pnpm
pnpm add three @tresjs/core
```

## Usage

```vue
<script setup lang="ts">
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import { Box3, Vector3 } from 'three'
import { Voxels } from '../utils/r3f-voxels'
import type { VoxelFace } from '../utils/r3f-voxels'

// Simple voxel generator function
const generator = (x: number, y: number, z: number) => {
  // Ground layer
  if (y < 0) return 1
  
  // Simple terrain with sine waves
  const height = Math.sin(x * 0.2) * 1.5 + Math.cos(z * 0.2) * 1.5
  if (y < height) return 1
  
  // Add some random blocks above ground
  if (y === Math.floor(height) && Math.random() > 0.95) return 2
  
  return 0 // Air
}

// Texture mapping function
const getTexture = (voxel: number, face: VoxelFace, isTop: boolean) => {
  if (voxel === 1) {
    // Ground - different texture for top
    return isTop ? 0 : 1
  }
  if (voxel === 2) {
    // Blocks
    return 2
  }
  return 0
}

// Transparency function
const getTransparent = (_voxel: number) => {
  return false // No transparent voxels in this example
}

// World bounds
const bounds = new Box3(
  new Vector3(-16, -8, -16),
  new Vector3(16, 16, 16)
)
</script>

<template>
  <TresCanvas window-size clear-color="#82DBC5">
    <TresPerspectiveCamera :position="[9, 9, 9]" />
    <OrbitControls />
    
    <!-- Voxel world -->
    <Voxels
      :generator="generator"
      :get-texture="getTexture"
      :get-transparent="getTransparent"
      :bounds="bounds"
      follow-camera
    />
    
    <!-- Other Three.js objects can be added alongside voxels -->
    <TresDirectionalLight :position="[0, 2, 4]" :intensity="1.2" cast-shadow />
  </TresCanvas>
</template>
```

## API

### Voxels Component Props

| Prop | Type | Description |
|------|------|-------------|
| `generator` | `(x: number, y: number, z: number) => number` | Function that returns the voxel type at a given position |
| `getTexture` | `(voxel: number, face: VoxelFace, isTop: boolean) => number` | Function that returns the texture index for a voxel |
| `getTransparent` | `(voxel: number) => boolean` | Function that determines if a voxel type is transparent |
| `getPhysics` | `() => { world: unknown, rapier: unknown }` | Function that returns physics world and rapier instance |
| `atlas` | `DataArrayTexture \| Texture \| null` | Texture atlas for voxel faces |
| `normalAtlas` | `DataArrayTexture \| Texture \| null` | Normal map atlas |
| `occlusionRoughnessMetalnessAtlas` | `DataArrayTexture \| Texture \| null` | ORM atlas |
| `bounds` | `Box3` | Bounds for chunk loading |
| `followCamera` | `boolean` | Whether chunks should follow the camera |
| `shaders` | `{ vertexShader?: string, fragmentShader?: string }` | Custom shaders |

### useVoxels Composable

The `useVoxels` composable provides access to the voxel API:

```vue
<script setup>
import { useVoxels } from '../utils/r3f-voxels'

// Get voxel API
const voxelApi = useVoxels()

// Set a voxel at position
function placeVoxel(x, y, z, type) {
  voxelApi.setVoxel(x, y, z, type)
}

// Get voxel at position
function getVoxelType(x, y, z) {
  return voxelApi.getVoxel(x, y, z)
}

// Clear all chunks
function clearWorld() {
  voxelApi.clearChunks()
}

// Export/import world
function saveWorld() {
  const worldData = voxelApi.exportChunks()
  localStorage.setItem('voxel-world', JSON.stringify(worldData))
}

function loadWorld() {
  const worldData = JSON.parse(localStorage.getItem('voxel-world') || '{}')
  voxelApi.importChunks(worldData)
}
</script>
```

## Conversion from r3f-voxels

This package is a port of r3f-voxels to TresJS (Vue 3). The API is similar, but adapted to Vue's patterns:

- React hooks are replaced with Vue composables
- React refs are replaced with Vue refs
- React context is replaced with Vue's provide/inject
- Components follow TresJS naming conventions

## License

MIT 