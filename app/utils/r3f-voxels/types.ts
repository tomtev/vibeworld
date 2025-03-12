import type { ChunkMaterial } from './chunk/ChunkMaterial'
import type { useData, VoxelFace } from './data/Data'
import type { Vector3 } from 'three'

type useDataType = ReturnType<typeof useData>

export interface VoxelsApi {
  addEventListener: useDataType['addEventListener']
  removeEventListener: useDataType['removeEventListener']
  clearChunks: useDataType['clearChunks']
  exportChunks: useDataType['exportChunks']
  importChunks: useDataType['importChunks']
  getMaterials: () => { opaque: ChunkMaterial; transparent: ChunkMaterial }
  getVoxel: useDataType['getVoxel']
  setVoxel: useDataType['setVoxel']
  getChunk: useDataType['getChunk']
  getPhysics?: () => { world: unknown; rapier: unknown }
  getTexture: (voxel: number, face: VoxelFace, isTop: boolean) => number
  getTransparent: (voxel: number) => boolean
  loaded: { value: { chunks: string[]; origin?: Vector3 } }
}
