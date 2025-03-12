<template>
  <div class="voxel-examples">
    <h1>Voxel Examples</h1>
    
    <div class="examples-container">
      <div class="example">
        <h2>Simple Terrain</h2>
        <div class="canvas-container">
          <TresCanvas shadows>
            <TresPerspectiveCamera :position="[20, 20, 20]" :fov="75" :near="0.1" :far="1000" />
            <OrbitControls :target="[8, 0, 8]" />
            <TresDirectionalLight :position="[10, 20, 10]" :intensity="1.5" cast-shadow />
            <TresAmbientLight :intensity="0.5" />
            <Voxels 
              :generator="terrainGenerator" 
              :bounds="terrainBounds"
              :follow-camera="false"
            />
          </TresCanvas>
        </div>
      </div>
      
      <div class="example">
        <h2>Colorful Structure</h2>
        <div class="canvas-container">
          <TresCanvas shadows>
            <TresPerspectiveCamera :position="[15, 15, 15]" :fov="75" :near="0.1" :far="1000" />
            <OrbitControls :target="[8, 8, 8]" />
            <TresDirectionalLight :position="[10, 20, 10]" :intensity="1.5" cast-shadow />
            <TresAmbientLight :intensity="0.5" />
            <Voxels 
              :generator="colorfulStructureGenerator" 
              :bounds="structureBounds"
              :get-texture="getColorfulTexture"
              :follow-camera="false"
            />
          </TresCanvas>
        </div>
      </div>
      
      <div class="example">
        <h2>Interactive Voxels</h2>
        <div class="canvas-container">
          <TresCanvas shadows>
            <TresPerspectiveCamera :position="[15, 15, 15]" :fov="75" :near="0.1" :far="1000" />
            <OrbitControls :target="[8, 4, 8]" />
            <TresDirectionalLight :position="[10, 20, 10]" :intensity="1.5" cast-shadow />
            <TresAmbientLight :intensity="0.5" />
            <Voxels 
              ref="interactiveVoxels"
              :generator="interactiveGenerator" 
              :bounds="interactiveBounds"
              :get-texture="getInteractiveTexture"
              :follow-camera="false"
            />
          </TresCanvas>
        </div>
        <div class="controls">
          <button @click="addVoxel">Add Voxel</button>
          <button @click="removeVoxel">Remove Voxel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Box3, Vector3 } from 'three';
import { TresCanvas } from '@tresjs/core';
import { OrbitControls } from '@tresjs/cientos';
import { Voxels } from '~/utils/r3f-voxels';
import type { VoxelFace, VoxelsApi } from '~/utils/r3f-voxels';

// Simple terrain generator
const terrainBounds = new Box3(new Vector3(-2, -1, -2), new Vector3(18, 5, 18));
const terrainGenerator = (x: number, y: number, z: number) => {
  // Base terrain
  const height = Math.sin(x * 0.3) * 2 + Math.cos(z * 0.3) * 2;
  
  if (y < height) {
    // Underground
    if (y < height - 3) return 3; // Stone
    if (y < height - 1) return 2; // Dirt
    return 1; // Grass
  }
  
  // Water
  if (y < 0 && height < 0) return 4;
  
  return 0; // Air
};

// Colorful structure generator
const structureBounds = new Box3(new Vector3(0, 0, 0), new Vector3(16, 16, 16));
const colorfulStructureGenerator = (x: number, y: number, z: number) => {
  // Create a colorful structure with different patterns
  
  // Base platform
  if (y === 0 && x >= 0 && x < 16 && z >= 0 && z < 16) return 1;
  
  // Pillars
  if ((x === 3 || x === 12) && (z === 3 || z === 12) && y > 0 && y < 12) return 2;
  
  // Walls
  if (y === 5 && ((x >= 3 && x <= 12 && (z === 3 || z === 12)) || (z >= 3 && z <= 12 && (x === 3 || x === 12)))) return 3;
  
  // Roof
  if (y === 11 && x >= 3 && x <= 12 && z >= 3 && z <= 12) return 4;
  
  // Decorative elements
  if (y === 6 && ((x === 7 || x === 8) && (z === 3 || z === 12))) return 5; // Windows
  if (y === 6 && ((z === 7 || z === 8) && (x === 3 || x === 12))) return 5; // Windows
  
  // Central structure
  const distFromCenter = Math.sqrt(Math.pow(x - 7.5, 2) + Math.pow(z - 7.5, 2));
  if (y > 11 && y < 15 && distFromCenter < 3) return 6;
  
  return 0; // Air
};

// Function to get texture index based on voxel type and face
const getColorfulTexture = (voxel: number, _face: VoxelFace) => {
  // Map different voxel types to different textures
  switch (voxel) {
    case 1: return 0; // Base platform
    case 2: return 1; // Pillars
    case 3: return 2; // Walls
    case 4: return 3; // Roof
    case 5: return 4; // Windows
    case 6: return 5; // Central structure
    default: return 0;
  }
};

// Interactive voxels
const interactiveVoxels = ref<VoxelsApi | null>(null);
const interactiveBounds = new Box3(new Vector3(0, 0, 0), new Vector3(16, 8, 16));

// Simple platform with some initial structures
const interactiveGenerator = (x: number, y: number, z: number) => {
  // Base platform
  if (y === 0 && x >= 0 && x < 16 && z >= 0 && z < 16) return 1;
  
  // Some initial structures
  if (y === 1 && x >= 6 && x <= 10 && z >= 6 && z <= 10) return 2;
  if (y === 2 && x >= 7 && x <= 9 && z >= 7 && z <= 9) return 3;
  if (y === 3 && x === 8 && z === 8) return 4;
  
  return 0; // Air
};

const getInteractiveTexture = (voxel: number, _face: VoxelFace) => {
  return voxel - 1; // Simple mapping
};

// Interactive functions
const addVoxel = () => {
  if (!interactiveVoxels.value) return;
  
  // Add a random voxel
  const x = Math.floor(Math.random() * 16);
  const z = Math.floor(Math.random() * 16);
  const y = Math.floor(Math.random() * 6) + 1;
  const voxelType = Math.floor(Math.random() * 4) + 1;
  
  interactiveVoxels.value.setVoxel(new Vector3(x, y, z), voxelType);
};

const removeVoxel = () => {
  if (!interactiveVoxels.value) return;
  
  // Try to find a non-air voxel to remove
  for (let attempts = 0; attempts < 10; attempts++) {
    const x = Math.floor(Math.random() * 16);
    const z = Math.floor(Math.random() * 16);
    const y = Math.floor(Math.random() * 6) + 1;
    
    // Don't remove the base platform
    if (y === 0) continue;
    
    const voxel = interactiveVoxels.value.getVoxel(new Vector3(x, y, z));
    if (voxel !== 0) {
      interactiveVoxels.value.setVoxel(new Vector3(x, y, z), 0);
      break;
    }
  }
};
</script>

<style scoped>
.voxel-examples {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
}

.examples-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.example {
  background-color: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h2 {
  padding: 1rem;
  margin: 0;
  background-color: #333;
  color: white;
}

.canvas-container {
  height: 300px;
  position: relative;
}

.controls {
  padding: 1rem;
  display: flex;
  gap: 1rem;
  justify-content: center;
}

button {
  padding: 0.5rem 1rem;
  background-color: #4a5568;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.2s;
}

button:hover {
  background-color: #2d3748;
}
</style> 