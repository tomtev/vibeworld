import { ref, watchEffect } from 'vue';
import { DataArrayTexture, SRGBColorSpace } from 'three';
import type { Texture } from 'three';
import { ChunkMaterial, ChunkDepthMaterial } from './ChunkMaterial';

const getAtlasTexture = (atlas: Texture) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error();
  }
  canvas.width = atlas.image.width;
  canvas.height = atlas.image.height;
  ctx.drawImage(atlas.image, 0, 0);
  const texture = new DataArrayTexture(
    ctx.getImageData(0, 0, canvas.width, canvas.height).data,
    canvas.width,
    canvas.width,
    canvas.height / canvas.width
  );
  texture.anisotropy = atlas.anisotropy;
  texture.minFilter = atlas.minFilter;
  texture.magFilter = atlas.magFilter;
  texture.needsUpdate = true;
  return texture;
};

export const useMaterials = (
  atlas?: DataArrayTexture | Texture | null,
  normalAtlas?: DataArrayTexture | Texture | null,
  occlusionRoughnessMetalnessAtlas?: DataArrayTexture | Texture | null,
  shaders?: {
    vertexShader?: string;
    fragmentShader?: string;
  }
) => {
  const atlasRef = ref<DataArrayTexture | null>(null);
  const normalAtlasRef = ref<DataArrayTexture | null>(null);
  const occlusionRoughnessMetalnessAtlasRef = ref<DataArrayTexture | null>(null);
  
  const depthMaterial = ref<ChunkDepthMaterial>(new ChunkDepthMaterial());
  const opaqueMaterial = ref<ChunkMaterial>(new ChunkMaterial(false));
  const transparentMaterial = ref<ChunkMaterial>(new ChunkMaterial(true, shaders || undefined));
  
  watchEffect(() => {
    if (atlasRef.value) {
      atlasRef.value.dispose();
    }
    let texture = atlas;
    if (texture && !(texture instanceof DataArrayTexture)) {
      texture = getAtlasTexture(texture);
      texture.colorSpace = SRGBColorSpace;
    }
    atlasRef.value = texture as (DataArrayTexture | null);
    opaqueMaterial.value.setAtlas(atlasRef.value);
    transparentMaterial.value.setAtlas(atlasRef.value);
  });
  
  watchEffect(() => {
    if (normalAtlasRef.value) {
      normalAtlasRef.value.dispose();
    }
    let texture = normalAtlas;
    if (texture && !(texture instanceof DataArrayTexture)) {
      texture = getAtlasTexture(texture);
    }
    normalAtlasRef.value = texture as (DataArrayTexture | null);
    opaqueMaterial.value.setNormalAtlas(normalAtlasRef.value);
    transparentMaterial.value.setNormalAtlas(normalAtlasRef.value);
  });
  
  watchEffect(() => {
    if (occlusionRoughnessMetalnessAtlasRef.value) {
      occlusionRoughnessMetalnessAtlasRef.value.dispose();
    }
    let texture = occlusionRoughnessMetalnessAtlas;
    if (texture && !(texture instanceof DataArrayTexture)) {
      texture = getAtlasTexture(texture);
    }
    occlusionRoughnessMetalnessAtlasRef.value = texture as (DataArrayTexture | null);
    opaqueMaterial.value.setOcclusionRoughnessMetalnessAtlas(occlusionRoughnessMetalnessAtlasRef.value);
    transparentMaterial.value.setOcclusionRoughnessMetalnessAtlas(occlusionRoughnessMetalnessAtlasRef.value);
  });
  
  return {
    depthMaterial,
    opaqueMaterial,
    transparentMaterial,
  };
};
