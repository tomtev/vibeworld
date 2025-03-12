import { inject } from 'vue'
import type { VoxelsApi } from '../index'

// Composable to access voxel API from child components
export function useVoxels(): VoxelsApi {
  const api = inject<VoxelsApi>('voxelData')
  
  if (!api) {
    throw new Error('tresjs-voxels: useVoxels must be used within <Voxels /> component!')
  }
  
  return api
}
