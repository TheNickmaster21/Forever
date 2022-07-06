import { GlobalSettings } from './global-settings';
import { Simple3DArray } from './simple-3d-array';

export interface Chunk {
    empty: boolean;
    full: boolean;
    voxels?: Simple3DArray<boolean>;
}

export interface RawChunk {
    empty: boolean;
    full: boolean;
    voxels?: boolean[][][];
}

export function chunkFromRawChunk(rawChunk: RawChunk): Chunk {
    return {
        ...rawChunk,
        voxels: rawChunk.voxels ? new Simple3DArray(rawChunk.voxels) : undefined
    };
}

export function rawChunkFromChunk(chunk: Chunk): RawChunk {
    return {
        ...chunk,
        voxels: chunk.voxels?.raw()
    };
}

export function chunkPositionToWorldPosition(position: Vector3): Vector3 {
    return position.mul(GlobalSettings.chunkSize * GlobalSettings.voxelSize);
}

export function chunkPositionToVoxelPosition(chunkPosition: Vector3): Vector3 {
    return chunkPosition.mul(GlobalSettings.chunkSize);
}

export function voxelPositionToChunkPosition(voxelPosition: Vector3): Vector3 {
    return new Vector3(
        math.floor(voxelPosition.X / GlobalSettings.chunkSize),
        math.floor(voxelPosition.Y / GlobalSettings.chunkSize),
        math.floor(voxelPosition.Z / GlobalSettings.chunkSize)
    );
}

export function voxelPositionToVoxelOffset(voxelPosition: Vector3): Vector3 {
    return new Vector3(
        voxelPosition.X % GlobalSettings.chunkSize,
        voxelPosition.Y % GlobalSettings.chunkSize,
        voxelPosition.Z % GlobalSettings.chunkSize
    );
}

export function voxelPositionToWorldPosition(voxelPosition: Vector3): Vector3 {
    return voxelPosition.mul(Vector3.one.mul(GlobalSettings.voxelSize));
}

export function chunkPositionAndVoxelOffsetToWorldPosition(position: Vector3, voxelOffset: Vector3): Vector3 {
    return chunkPositionToWorldPosition(position).add(voxelOffset.mul(GlobalSettings.voxelSize));
}

export function worldPositionToChunkPosition(position: Vector3): Vector3 {
    return new Vector3(
        math.floor(position.X / (GlobalSettings.chunkSize * GlobalSettings.voxelSize)),
        math.floor(position.Y / (GlobalSettings.chunkSize * GlobalSettings.voxelSize)),
        math.floor(position.Z / (GlobalSettings.chunkSize * GlobalSettings.voxelSize))
    );
}
