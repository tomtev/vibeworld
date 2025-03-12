import { ref } from 'vue'
import { EventDispatcher, Vector3 } from 'three'
import type { Box3 } from 'three'
import { ChunkData, type ChunkData as ChunkDataType } from './ChunkData'

export const chunkSize = 16

// Re-export ChunkData
export { ChunkData, type ChunkData as ChunkDataType } from './ChunkData'

export enum VoxelFace {
  south,
  top,
  bottom,
  west,
  east,
  north
}

const auxA = new Vector3()
const auxB = new Vector3()
const auxC = new Vector3()

const getChunkKey = (position: Vector3) => (
  `${position.x}:${position.y}:${position.z}`
)

export const createDataStore = (
  generator?: (x: number, y: number, z: number) => number,
  getPhysics?: () => { world: unknown; rapier: unknown },
  getTexture: (voxel: number, face: VoxelFace, isTop: boolean) => number = (v) => (v - 1),
  getTransparent: (voxel: number) => boolean = () => false
) => {
  const chunks = new Map<string, { value: ChunkDataType }>()
  const getChunk = (x: Vector3 | number, y?: number, z?: number) => {
    const position = x instanceof Vector3 ? x : auxA.set(x, y!, z!)
    const key = getChunkKey(position)
    let chunk = chunks.get(key)
    if (!chunk) {
      const voxels = new Uint8Array(chunkSize * chunkSize * chunkSize)
      const worldPosition = position.clone().multiplyScalar(chunkSize)
      if (generator) {
        for (let i = 0, z = 0; z < chunkSize; z++) {
          for (let y = 0; y < chunkSize; y++) {
            for (let x = 0; x < chunkSize; x++, i++) {
              voxels[i] = generator(
                worldPosition.x + x,
                worldPosition.y + y,
                worldPosition.z + z
              )
            }
          }
        }
      }
      chunk = {
        value: ChunkData.create(false, worldPosition, voxels)
      }
      chunks.set(key, chunk)
    }
    return chunk
  }
  const events = new EventDispatcher<{
    change: { position: Vector3; value: number }
  }>()
  const loaded = ref<{ chunks: string[]; origin?: Vector3 }>({ chunks: [] })
  return {
    loaded,
    addEventListener: events.addEventListener.bind(events),
    removeEventListener: events.removeEventListener.bind(events),
    getChunk,
    loadChunks: (origin: Vector3, bounds: Box3) => {
      const { chunks: current } = loaded.value
      const next: string[] = []
      for (let z = bounds.min.z; z < bounds.max.z; z++) {
        for (let y = bounds.min.y; y < bounds.max.y; y++) {
          for (let x = bounds.min.x; x < bounds.max.x; x++) {
            next.push(getChunkKey(auxA.copy(origin).add(new Vector3(x, y, z))))
          }
        }
      }
      current.forEach((key) => {
        if (next.includes(key)) return
        auxA.fromArray(key.split(':').map((p) => parseInt(p, 10)))
        if (
          auxA.x < origin.x + bounds.min.x * 2
          || auxA.y < origin.y + bounds.min.y * 2
          || auxA.y < origin.z + bounds.min.z * 2
          || auxA.x >= origin.x + bounds.max.x * 2
          || auxA.y >= origin.y + bounds.max.y * 2
          || auxA.y >= origin.z + bounds.max.z * 2
        ) {
          return
        }
        next.push(key)
      })
      loaded.value = { chunks: next, origin: origin.clone() }
    },
    clearChunks: () => {
      chunks.clear()
      loaded.value = { chunks: [] }
    },
    exportChunks: () => {
      const serialized: { [key: string]: Uint8Array } = {}
      chunks.forEach((chunk, key) => {
        const data = chunk.value
        if (data.modified) {
          serialized[key] = data.voxels
        }
      })
      return serialized
    },
    importChunks: (serialized: { [key: string]: Uint8Array }) => {
      for (const [key, voxels] of Object.entries(serialized)) {
        const position = new Vector3().fromArray(key.split(':').map((p) => parseInt(p, 10))).multiplyScalar(chunkSize)
        const data = ChunkData.create(true, position, voxels)
        if (chunks.has(key)) {
          chunks.get(key)!.value = data
        } else {
          chunks.set(key, { value: data })
        }
      }
    },
    getPhysics,
    getTexture,
    getTransparent,
    getVoxel: (position: Vector3) => {
      const voxelChunk = auxA.copy(position).divideScalar(chunkSize).floor()
      const voxel = auxB.copy(position).sub(auxC.copy(voxelChunk).multiplyScalar(chunkSize))
      const chunk = getChunk(voxelChunk)
      const data = chunk.value
      return data.voxels[voxel.z * chunkSize * chunkSize + voxel.y * chunkSize + voxel.x]
    },
    setVoxel: (position: Vector3, value: number) => {
      const voxelChunk = auxA.copy(position).divideScalar(chunkSize).floor()
      const voxel = auxB.copy(position).sub(auxC.copy(voxelChunk).multiplyScalar(chunkSize))
      const chunk = getChunk(voxelChunk)
      const data = chunk.value
      data.modified = true
      data.voxels[voxel.z * chunkSize * chunkSize + voxel.y * chunkSize + voxel.x] = value
      chunk.value = { ...data }
      events.dispatchEvent({ type: 'change', position, value })
    },
  }
}

// Vue composable to use the data store
export const useData = () => {
  // This would normally use inject, but for simplicity we'll create a new store
  // In practice, this should be injected from a provider
  return createDataStore()
}
