import { Air, BlockType } from './block';
import { DistinctType } from './distinct-type';
import { GlobalSettings } from './global-settings';
import { iterateInVectorRange } from './grid-utils';
import { Simple3DArray } from './simple-3d-array';

export interface Chunk {
    empty: boolean;
    voxels?: Simple3DArray<BlockType, LocalChunkOffset>;
}

export interface RawChunk {
    empty: boolean;
    voxels?: string;
}

/** Physical location in the Workspace */
export type WorkspacePosition = DistinctType<Vector3, 'WorkspacePosition'>;
/** A chunk's position in the chunk 3D array */
export type ChunkPosition = DistinctType<Vector3, 'ChunkPosition'>;
/** A voxel's position in a chunk's 3D array */
export type LocalChunkOffset = DistinctType<Vector3, 'LocalChunkOffset'>;
/** A voxel's positional offset if the entire workspace was a single chunk */
export type GlobalVoxelPosition = DistinctType<Vector3, 'GlobalVoxelPosition'>;

const ASCIISkipSpecialCharactersOffset = 33;

export function chunkFromRawChunk(rawChunk: RawChunk): Chunk {
    let voxels: BlockType[][][] | undefined;
    if (rawChunk.voxels !== undefined) {
        voxels = [];
        let index = 0;
        for (const char of rawChunk.voxels) {
            const [x, y, z] = [
                math.floor(index / (GlobalSettings.chunkSize * GlobalSettings.chunkSize)) % GlobalSettings.chunkSize,
                math.floor(index / GlobalSettings.chunkSize) % GlobalSettings.chunkSize,
                index % GlobalSettings.chunkSize
            ];
            if (y === 0 && z === 0) voxels[x] = [];
            if (z === 0) voxels[x][y] = [];
            voxels[x][y][z] = (string.byte(char)[0] - ASCIISkipSpecialCharactersOffset) as BlockType;
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
                    flatVoxelArray.push(v + ASCIISkipSpecialCharactersOffset);
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

export function initialVoxelsFromEmpty(): Simple3DArray<BlockType, LocalChunkOffset> {
    const voxels: BlockType[][][] = [];
    iterateInVectorRange(
        new Vector3(0, 0, 0),
        new Vector3(GlobalSettings.chunkSize, GlobalSettings.chunkSize, GlobalSettings.chunkSize),
        (vector: Vector3) => {
            if (vector.Y === 0 && vector.Z === 0) voxels[vector.X] = [];
            if (vector.Z === 0) voxels[vector.X][vector.Y] = [];
            voxels[vector.X][vector.Y][vector.Z] = Air;
        }
    );
    return new Simple3DArray(voxels);
}

export function chunkPositionToWorkspacePosition(chunkPosition: ChunkPosition): WorkspacePosition {
    return chunkPosition.mul(GlobalSettings.chunkSize * GlobalSettings.voxelSize) as WorkspacePosition;
}

export function chunkPositionToVoxelPosition(chunkPosition: ChunkPosition): GlobalVoxelPosition {
    return chunkPosition.mul(GlobalSettings.chunkSize) as GlobalVoxelPosition;
}

export function voxelPositionToChunkPosition(voxelPosition: GlobalVoxelPosition): ChunkPosition {
    return new Vector3(
        math.floor(voxelPosition.X / GlobalSettings.chunkSize),
        math.floor(voxelPosition.Y / GlobalSettings.chunkSize),
        math.floor(voxelPosition.Z / GlobalSettings.chunkSize)
    ) as ChunkPosition;
}

export function voxelPositionToVoxelOffset(voxelPosition: GlobalVoxelPosition): LocalChunkOffset {
    return new Vector3(
        voxelPosition.X % GlobalSettings.chunkSize,
        voxelPosition.Y % GlobalSettings.chunkSize,
        voxelPosition.Z % GlobalSettings.chunkSize
    ) as LocalChunkOffset;
}

export function voxelPositionToWorkspacePosition(voxelPosition: GlobalVoxelPosition): WorkspacePosition {
    return voxelPosition.mul(Vector3.one.mul(GlobalSettings.voxelSize)) as WorkspacePosition;
}

export function chunkPositionAndVoxelOffsetToWorkspacePosition(
    chunkPosition: ChunkPosition,
    voxelOffset: LocalChunkOffset
): WorkspacePosition {
    return chunkPositionToWorkspacePosition(chunkPosition).add(
        voxelOffset.mul(GlobalSettings.voxelSize)
    ) as WorkspacePosition;
}

export function workspacePositionToChunkPosition(workspacePosition: WorkspacePosition): ChunkPosition {
    return new Vector3(
        math.floor(workspacePosition.X / (GlobalSettings.chunkSize * GlobalSettings.voxelSize)),
        math.floor(workspacePosition.Y / (GlobalSettings.chunkSize * GlobalSettings.voxelSize)),
        math.floor(workspacePosition.Z / (GlobalSettings.chunkSize * GlobalSettings.voxelSize))
    ) as ChunkPosition;
}

export function workspacePositionToChunkOffset(workspacePosition: WorkspacePosition): LocalChunkOffset {
    return new Vector3(
        math.floor(workspacePosition.X / GlobalSettings.voxelSize) % GlobalSettings.chunkSize,
        math.floor(workspacePosition.Y / GlobalSettings.voxelSize) % GlobalSettings.chunkSize,
        math.floor(workspacePosition.Z / GlobalSettings.voxelSize) % GlobalSettings.chunkSize
    ) as LocalChunkOffset;
}
