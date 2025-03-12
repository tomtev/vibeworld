<script setup lang="ts">
import { TresCanvas } from '@tresjs/core';
import { OrbitControls } from '@tresjs/cientos';
import { Box3, Vector3 } from 'three';
import { Voxels } from '../utils/r3f-voxels';
import type { VoxelFace } from '../utils/r3f-voxels';

// Simple voxel generator function
const generator = (x: number, y: number, z: number) => {
  // Ground layer
  if (y < 0) return 1;
  
  // Simple terrain with sine waves
  const height = Math.sin(x * 0.2) * 1.5 + Math.cos(z * 0.2) * 1.5;
  if (y < height) return 1;
  
  // Add some random blocks above ground
  if (y === Math.floor(height) && Math.random() > 0.95) return 2;
  
  return 0; // Air
};

// Texture mapping function
const getTexture = (voxel: number, face: VoxelFace, isTop: boolean) => {
  if (voxel === 1) {
    // Ground - different texture for top
    return isTop ? 0 : 1;
  }
  if (voxel === 2) {
    // Blocks
    return 2;
  }
  return 0;
};

// Transparency function
const getTransparent = (_voxel: number) => {
  return false; // No transparent voxels in this example
};

// World bounds
const bounds = new Box3(
  new Vector3(-16, -8, -16),
  new Vector3(16, 16, 16)
);
</script>

<template>
  <div class="container">
    <div class="nav-bar">
      <h1>Voxel World</h1>
      <div class="nav-links">
        <NuxtLink to="/" class="nav-link active">Home</NuxtLink>
        <NuxtLink to="/voxel-examples" class="nav-link">Voxel Examples</NuxtLink>
      </div>
    </div>
    
    <TresCanvas window-size clear-color="#82DBC5">
      <TresPerspectiveCamera :position="[9, 9, 9]" />
      <OrbitControls />
      <TresAmbientLight :intensity="0.5" />
      <TresDirectionalLight :position="[10, 10, 10]" :intensity="1" cast-shadow />
      <Voxels 
        :generator="generator" 
        :bounds="bounds" 
        :get-texture="getTexture"
        :get-transparent="getTransparent"
        :follow-camera="true"
      />
    </TresCanvas>
  </div>
</template>

<style scoped>
.container {
  position: relative;
  width: 100%;
  height: 100vh;
}

.nav-bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  z-index: 10;
}

h1 {
  margin: 0;
  font-size: 1.5rem;
}

.nav-links {
  display: flex;
  gap: 1rem;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-link.active {
  background-color: rgba(255, 255, 255, 0.2);
}
</style>