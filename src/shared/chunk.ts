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

export function chunkPosToWorldPos(pos: Vector3): Vector3 {
    return pos.mul(GlobalSettings.chunkSize);
}

export function chunkPosAndOffsetToWorldPos(pos: Vector3, voxelOffset: Vector3): Vector3 {
    return chunkPosToWorldPos(pos).add(voxelOffset);
}

export function worldPosToChunkPos(pos: Vector3): Vector3 {
    return new Vector3(
        math.floor(pos.X / GlobalSettings.chunkSize),
        math.floor(pos.Y / GlobalSettings.chunkSize),
        math.floor(pos.Z / GlobalSettings.chunkSize)
    );
}

export function worldPosToChunkOffset(pos: Vector3): Vector3 {
    return new Vector3(
        pos.X % GlobalSettings.chunkSize,
        pos.Y % GlobalSettings.chunkSize,
        pos.Z % GlobalSettings.chunkSize
    );
}
