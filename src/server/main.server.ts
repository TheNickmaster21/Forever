import { CrochetServer } from '@rbxts/crochet';
import { Air, BlockType, DarkStone, Dirt, Grass, LightStone } from 'shared/block';
import {
    Chunk,
    ChunkPosition,
    chunkPositionToVoxelPosition,
    initialVoxelsFromEmpty,
    LocalChunkOffset,
    rawChunkFromChunk
} from 'shared/chunk';
import {
    BlockChangeReplicationEvent,
    BlockChangeRequestReplicationEvent,
    FullChunkReplicationEvent
} from 'shared/events';
import { GlobalSettings } from 'shared/global-settings';
import { LazyScheduler } from 'shared/lazy-scheduler';
import { manhattanSpread } from 'shared/manhattan-spread';
import { Simple3DArray } from 'shared/simple-3d-array';

const seed = os.time();

const chunks = new Simple3DArray<Chunk, ChunkPosition>();

interface Crater {
    size: number;
    position: Vector3;
    stretch: Vector3;
}

// TODO
interface Worm {
    segments: {
        startPosition: Vector3;
        endPosition: Vector3;
        width: number;
    }[];
}

interface ChunkMetaInfo {
    crater: Crater | undefined;
    caveWorm: Worm | undefined;
}

const MetaInfoDistance = 3;
const chunkMetaInfos = new Simple3DArray<ChunkMetaInfo>();

function generateChunkMetaInfo(chunkPos: Vector3): ChunkMetaInfo {
    const metaSeed = seed * math.noise(chunkPos.X / 10, chunkPos.Y / 10, chunkPos.Z / 10);
    math.randomseed(metaSeed);

    let crater: Crater | undefined;
    if (math.random() < 0.5) {
        crater = {
            size: math.random(2, 10),
            position: new Vector3(
                math.random(0, GlobalSettings.chunkSize - 1),
                math.random(0, GlobalSettings.chunkSize - 1),
                math.random(0, GlobalSettings.chunkSize - 1)
            ),
            stretch: new Vector3(math.random() + 0.5, math.random() + 0.5, math.random() + 0.5)
        };
    }

    let caveWorm: Worm | undefined;
    if (math.random() < 0.05) {
        caveWorm = { segments: [] };
    }

    const chunk = {
        crater,
        caveWorm
    };
    chunkMetaInfos.vectorSet(chunkPos, chunk);
    return chunk;
}

function getChunkMetaInfo(chunkPos: Vector3): ChunkMetaInfo {
    let chunkMeta = chunkMetaInfos.vectorGet(chunkPos);
    if (chunkMeta === undefined) {
        chunkMeta = generateChunkMetaInfo(chunkPos);
    }
    return chunkMeta;
}

const chunkFolder = new Instance('Folder');
chunkFolder.Name = 'Chunks';
chunkFolder.Parent = game.Workspace;

function createRawVoxel(
    chunkPos: ChunkPosition,
    voxelOffset: LocalChunkOffset,
    relevantMetaInfo: Simple3DArray<ChunkMetaInfo>
): BlockType {
    const absoluteVoxelPos = chunkPositionToVoxelPosition(chunkPos).add(voxelOffset);
    let inCrater = false;
    manhattanSpread(MetaInfoDistance, (offset) => {
        const meta = relevantMetaInfo.vectorGet(offset);
        if (!meta) return;
        if (meta.crater) {
            const craterPos = chunkPositionToVoxelPosition(chunkPos)
                .add(offset.mul(GlobalSettings.chunkSize))
                .add(meta.crater.position);
            if (meta.crater.size >= craterPos.sub(absoluteVoxelPos).mul(meta.crater.stretch).Magnitude) {
                inCrater = true;
                return 'break';
            }
        }
    });
    if (inCrater) return 0;
    let height = 15 * math.noise(absoluteVoxelPos.X / 100, absoluteVoxelPos.Z / 100, seed);
    height += 7 * math.noise(absoluteVoxelPos.X / 15, absoluteVoxelPos.Z / 15, seed + 10);

    if (absoluteVoxelPos.Y >= height) {
        return Air;
    } else if (height - absoluteVoxelPos.Y < 1) {
        return Grass;
    } else if (height - absoluteVoxelPos.Y < 5) {
        return Dirt;
    } else if (height - absoluteVoxelPos.Y < 25) {
        return LightStone;
    } else {
        return DarkStone;
    }
}

function createChunk(chunkPos: ChunkPosition): Chunk {
    debug.profilebegin('Create Chunk');
    const voxels = new Simple3DArray<BlockType>();
    const relevantMetaInfo = new Simple3DArray<ChunkMetaInfo>();
    manhattanSpread(MetaInfoDistance, (offset) => {
        relevantMetaInfo.vectorSet(offset, getChunkMetaInfo(chunkPos.add(offset)));
    });

    let empty = true;
    for (let voxelX = 0; voxelX < GlobalSettings.chunkSize; voxelX++) {
        for (let voxelY = 0; voxelY < GlobalSettings.chunkSize; voxelY++) {
            for (let voxelZ = 0; voxelZ < GlobalSettings.chunkSize; voxelZ++) {
                const voxel = createRawVoxel(
                    chunkPos,
                    new Vector3(voxelX, voxelY, voxelZ) as LocalChunkOffset,
                    relevantMetaInfo
                );

                voxels.set(voxelX, voxelY, voxelZ, voxel);
                empty = empty && voxel === 0;
            }
        }
    }

    const chunk = { empty, voxels: !empty ? voxels : undefined };
    chunks.vectorSet(chunkPos, chunk);
    debug.profileend();
    return chunk;
}

const generationScheduler = new LazyScheduler();

CrochetServer.registerRemoteEvent(FullChunkReplicationEvent);
const replicateChunk = CrochetServer.getRemoteEventFunction(FullChunkReplicationEvent);
CrochetServer.bindRemoteEvent(FullChunkReplicationEvent, (player, chunkPos, _value) => {
    const chunk = chunks.vectorGet(chunkPos);
    if (chunk !== undefined) {
        replicateChunk(player, chunkPos, rawChunkFromChunk(chunk));
    }

    generationScheduler.queueTask(() => {
        replicateChunk(player, chunkPos, rawChunkFromChunk(createChunk(chunkPos)));
    });
});

CrochetServer.registerRemoteEvent(BlockChangeReplicationEvent);
const replicateBlockChange = CrochetServer.getRemoteEventAllFunction(BlockChangeReplicationEvent);

CrochetServer.registerRemoteEvent(BlockChangeRequestReplicationEvent);
CrochetServer.bindRemoteEvent(BlockChangeRequestReplicationEvent, (player, chunkPos, voxelPos, blockType) => {
    const chunk = chunks.vectorGet(chunkPos);
    const voxel = chunk?.voxels?.vectorGet(voxelPos);

    if (voxel !== undefined && voxel !== blockType) {
        if (chunk?.empty) {
            chunk.voxels = initialVoxelsFromEmpty();
        }
        chunk?.voxels?.vectorSet(voxelPos, blockType);
        replicateBlockChange(chunkPos, voxelPos, blockType);
    }
});

CrochetServer.start();
