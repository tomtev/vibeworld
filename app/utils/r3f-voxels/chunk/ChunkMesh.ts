import {
  InstancedBufferGeometry,
  InstancedInterleavedBuffer,
  InterleavedBufferAttribute,
  Matrix4,
  Mesh,
  PlaneGeometry,
  Sphere,
  Vector4,
} from 'three';
import type {
  Box3,
  BufferAttribute,
  Object3D,
  Object3DEventMap,
  Raycaster,
} from 'three';

// Define a compatible Intersection type based on Three.js v0.174.0
type Intersection<T extends Object3D = Object3D> = {
  distance: number;
  point: import('three').Vector3;
  face?: import('three').Face | null;
  faceIndex?: number | null;
  object: T;
  uv?: import('three').Vector2;
  instanceId?: number;
};

const _face = new Vector4();
const _intersects: Intersection<Object3D<Object3DEventMap>>[] = [];
const _sphere = new Sphere();
const _translation = new Matrix4();

export class ChunkMesh extends Mesh {
  private static geometry?: {
    index: BufferAttribute,
    position: BufferAttribute,
    normal: BufferAttribute,
    uv: BufferAttribute,
    instance: Mesh,
    rotations: Matrix4[],
  };

  private static getGeometry() {
    if (!ChunkMesh.geometry) { 
      const face = new PlaneGeometry(1, 1, 1, 1);
      face.translate(0, 0, 0.5);
      const uv = face.getAttribute('uv');
      for (let i = 0, l = uv.count; i < l; i++) {
        uv.setXY(i, uv.getX(i), 1.0 - uv.getY(i));
      }
      ChunkMesh.geometry = {
        index: face.getIndex() as BufferAttribute,
        position: face.getAttribute('position') as BufferAttribute,
        normal: face.getAttribute('normal') as BufferAttribute,
        uv: uv as BufferAttribute,
        instance: new Mesh(face),
        rotations: [
          new Matrix4(),
          new Matrix4().makeRotationX(Math.PI * -0.5),
          new Matrix4().makeRotationX(Math.PI * 0.5),
          new Matrix4().makeRotationY(Math.PI * -0.5),
          new Matrix4().makeRotationY(Math.PI * 0.5),
          new Matrix4().makeRotationY(Math.PI),
        ],
      };
    }
    return ChunkMesh.geometry;
  }

  constructor() {
    const geometry = new InstancedBufferGeometry();
    geometry.boundingSphere = new Sphere();
    const { index, position, normal, uv } = ChunkMesh.getGeometry();
    geometry.setIndex(index);
    geometry.setAttribute('position', position);
    geometry.setAttribute('normal', normal);
    geometry.setAttribute('uv', uv);
    super(geometry);
    this.geometry = geometry;
    this.visible = false;
  }

  override raycast(raycaster: Raycaster, intersects: Intersection<Object3D<Object3DEventMap>>[]) {
    const { instance, rotations } = ChunkMesh.getGeometry();
    const { matrixWorld, visible } = this;
    const geometry = this.geometry as InstancedBufferGeometry;
    if (!visible || !instance || !rotations) {
      return;
    }
    _sphere.copy(geometry.boundingSphere!);
    _sphere.applyMatrix4(matrixWorld);
    if (!raycaster.ray.intersectsSphere(_sphere)) {
      return;
    }
    const face = geometry.getAttribute('face') as BufferAttribute;
    for (let i = 0, l = geometry.instanceCount; i < l; i++) {
      _face.fromBufferAttribute(face, i);
      const faceIndex = Math.floor(_face.w % 6);
      const rotation = rotations[faceIndex];
      if (!rotation) continue;
      
      instance.matrixWorld
        .multiplyMatrices(matrixWorld, _translation.makeTranslation(_face.x, _face.y, _face.z))
        .multiply(rotation);
      instance.raycast(raycaster, _intersects);
      _intersects.forEach((intersect) => {
        intersect.object = this;
        if (intersect.face?.normal) {
          intersect.face.normal.transformDirection(instance.matrixWorld);
        }
        intersects.push(intersect);
      });
      _intersects.length = 0;
    }
  }

  update({ bounds, faces }: { bounds: Box3, faces: Float32Array }) {
    const geometry = this.geometry as InstancedBufferGeometry;
    const count = faces.length / 8;
    if (!count) {
      this.visible = false;
      return;
    }
    bounds.getBoundingSphere(geometry.boundingSphere!);
    const buffer = new InstancedInterleavedBuffer(faces, 8, 1);
    geometry.setAttribute('face', new InterleavedBufferAttribute(buffer, 4, 0));
    geometry.setAttribute('ao', new InterleavedBufferAttribute(buffer, 4, 4));
    geometry.instanceCount = count;
    this.visible = true;
  }
}
