import type { Vector3 } from 'three'

// Define the ChunkData interface
export interface ChunkData {
  modified: boolean
  position: Vector3
  voxels: Uint8Array
}

// Create a factory function to ensure the type is available at runtime
export const createChunkData = (
  modified: boolean, 
  position: Vector3, 
  voxels: Uint8Array
): ChunkData => ({
  modified,
  position,
  voxels
})

// Export a namespace for compatibility
export const ChunkData = {
  create: createChunkData
}
