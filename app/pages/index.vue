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
    
    <!-- Original shapes -->
    <TresMesh :position="[-2, 2, 0]" :rotation="[0, Math.PI, 0]">
      <TresConeGeometry :args="[1, 1.5, 3]" />
      <TresMeshToonMaterial color="#82DBC5" />
    </TresMesh>
    <TresMesh :position="[0, 0, 0]" cast-shadow>
      <TresBoxGeometry :args="[1.5, 1.5, 1.5]" />
      <TresMeshToonMaterial color="#4F4F4F" />
    </TresMesh>
    <TresMesh :position="[2, -2, 0]">
      <TresSphereGeometry />
      <TresMeshToonMaterial color="#FBB03B" />
    </TresMesh>
    <TresDirectionalLight :position="[0, 2, 4]" :intensity="1.2" cast-shadow />
  </TresCanvas>
</template>

<style>
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
}
#app {
  height: 100%;
  width: 100%;
  background-color: #000;
}
</style>