import type { ChunkMaterial } from './chunk/ChunkMaterial'
import type { useData } from './data/Data'

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
}
