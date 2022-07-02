import { GlobalSettings } from './global-settings';
import { Simple3DArray } from './simple-3d-array';

export type Chunk = Simple3DArray<boolean>;

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
