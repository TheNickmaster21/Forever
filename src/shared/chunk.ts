import { BlockType } from './block';
import { GlobalSettings } from './global-settings';
import { Simple3DArray } from './simple-3d-array';

export interface Chunk {
    empty: boolean;
    voxels?: Simple3DArray<BlockType>;
}

export interface RawChunk {
    empty: boolean;
    voxels?: string;
}

export function chunkFromRawChunk(rawChunk: RawChunk): Chunk {
    let voxels: BlockType[][][] | undefined;
    if (rawChunk.voxels !== undefined) {
        voxels = [];
        let index = 0;
        for (const char of rawChunk.voxels) {
            const [x, y, z] = [math.floor(index / (16 * 16)) % 16, math.floor(index / 16) % 16, index % 16];
            if (y === 0 && z === 0) voxels[x] = [];
            if (z === 0) voxels[x][y] = [];
            voxels[x][y][z] = (string.byte(char)[0] - 35) as BlockType;
            index++;
        }
    }

    return {
        ...rawChunk,
        voxels: voxels !== undefined ? new Simple3DArray(voxels) : undefined
    };
}

export function rawChunkFromChunk(chunk: Chunk): RawChunk {
    let voxels: string | undefined;
    if (chunk.voxels !== undefined) {
        const flatVoxelArray = [];
        for (const arrX of chunk.voxels.raw()) {
            for (const arrY of arrX) {
                for (const v of arrY) {
                    flatVoxelArray.push(v + 35);
                }
            }
        }
        voxels = string.char(...flatVoxelArray);
    }

    return {
        ...chunk,
        voxels
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

export function worldPositionToChunkOffsett(position: Vector3): Vector3 {
    return new Vector3(
        math.floor(position.X / GlobalSettings.voxelSize) % GlobalSettings.chunkSize,
        math.floor(position.Y / GlobalSettings.voxelSize) % GlobalSettings.chunkSize,
        math.floor(position.Z / GlobalSettings.voxelSize) % GlobalSettings.chunkSize
    );
}
