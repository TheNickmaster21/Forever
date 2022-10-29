import { CrochetClient } from '@rbxts/crochet';
import { Air, BlockConfig, BlockType, BlockTypeAttribute } from 'shared/block';
import {
    Chunk,
    chunkFromRawChunk,
    chunkPositionToVoxelPosition,
    chunkPositionToWorldPosition,
    initialVoxelsFromEmpty,
    voxelPositionToChunkPosition,
    voxelPositionToVoxelOffset,
    voxelPositionToWorldPosition,
    worldPositionToChunkPosition
} from 'shared/chunk';
import { BlockChangeReplicationEvent, FullChunkReplicationEvent } from 'shared/events';
import { GlobalSettings } from 'shared/global-settings';
import { flat3DNeighborFunction, iterateInVectorRange, eightNeighborOffsets } from 'shared/grid-utils';
import { LazyScheduler } from 'shared/lazy-scheduler';
import { manhattanSpread } from 'shared/manhattan-spread';
import { Simple3DArray } from 'shared/simple-3d-array';
import { startCrochetPromise } from './crochet-start';

startCrochetPromise.await();

const player = game.GetService('Players').LocalPlayer;
let character = player.Character;
let rootPart = character?.WaitForChild('HumanoidRootPart') as Part;
player.CharacterAdded.Connect((char) => {
    character = char;
    rootPart = character?.WaitForChild('HumanoidRootPart') as Part;
});

const chunkFolder = game.Workspace.WaitForChild('Chunks');
const recyclingFolder = new Instance('Folder');
recyclingFolder.Name = 'RecyclingFolder';
recyclingFolder.Parent = game.GetService('ReplicatedStorage');
const recycledVoxels: Part[] = [];

const knownChunks = new Simple3DArray<Chunk>();
const fetchingChunks = new Simple3DArray<boolean>();

const renderingChunks = new Simple3DArray<boolean>();
const renderedChunks = new Simple3DArray<boolean>();
let renderedChunkModelCount = 0;

const terrainScheduler = new LazyScheduler();

function characterPosition() {
    return rootPart.Position;
}

function characterAtChunk(): Vector3 {
    return worldPositionToChunkPosition(characterPosition());
}

const replicationEventFunction = CrochetClient.getRemoteEventFunction(FullChunkReplicationEvent);

function fetchChunk(vector: Vector3): void {
    if (fetchingChunks.vectorGet(vector)) return;

    fetchingChunks.vectorSet(vector, true);
    replicationEventFunction(vector, undefined);
}

CrochetClient.bindRemoteEvent(FullChunkReplicationEvent, (vector, value) => {
    if (value === undefined) {
        return;
    }
    knownChunks.vectorSet(vector, chunkFromRawChunk(value));
});

CrochetClient.bindRemoteEvent(BlockChangeReplicationEvent, (chunkPos, voxelPos, blockType) => {
    print(chunkPos, voxelPos, blockType);
    const chunk = knownChunks.vectorGet(chunkPos);
    if (chunk === undefined) {
        return;
    }

    if (chunk.empty) {
        chunk.voxels = initialVoxelsFromEmpty();
    }
    chunk.voxels?.vectorSet(voxelPos, blockType);

    // Ugly hack to rerender a chunk fully
    const physicalChunk = chunkFolder.FindFirstChild(vectorName(chunkPos));
    physicalChunk?.Destroy();
    renderedChunks.vectorDelete(chunkPos);

    print('bye chunk');
});

function vectorName(vector: Vector3): string {
    return `${vector.X},${vector.Y},${vector.Z}`;
}

function createVoxel(worldPosition: Vector3, blockType: BlockType, parent: Model) {
    const voxel = recycledVoxels.pop() ?? new Instance('Part');
    // voxel.Transparency = 0.8;
    voxel.Name = vectorName(worldPosition);
    voxel.Size = new Vector3(GlobalSettings.voxelSize, GlobalSettings.voxelSize, GlobalSettings.voxelSize);
    voxel.TopSurface = Enum.SurfaceType.Smooth;
    voxel.BottomSurface = Enum.SurfaceType.Smooth;
    voxel.Color = BlockConfig[blockType].color;
    voxel.Material = BlockConfig[blockType].material;
    voxel.Anchored = true;
    voxel.Position = worldPosition;
    CrochetClient.setAttribute(voxel, BlockTypeAttribute, blockType);
    voxel.Parent = parent;
}

function getVoxel(voxelPosition: Vector3): BlockType | undefined {
    const chunk = knownChunks.vectorGet(voxelPositionToChunkPosition(voxelPosition));
    if (!chunk) return undefined;
    if (chunk.empty) return 0;
    if (!chunk.voxels) return undefined;
    return chunk.voxels.vectorGet(voxelPositionToVoxelOffset(voxelPosition));
}

function createChunk(chunkPosition: Vector3) {
    // Avoid double rendering a chunk
    if (renderedChunks.vectorGet(chunkPosition) || renderingChunks.vectorGet(chunkPosition)) return;

    const chunk = knownChunks.vectorGet(chunkPosition);
    if (!chunk) return;
    if (chunk.empty) {
        renderedChunks.vectorSet(chunkPosition, true);
        renderingChunks.vectorDelete(chunkPosition);
        return;
    }
    const neighborChunksExist = flat3DNeighborFunction(knownChunks, chunkPosition, (chunk) => chunk !== undefined);
    const missingNeighbor = neighborChunksExist.includes(false);
    if (missingNeighbor) return;

    renderingChunks.vectorSet(chunkPosition, true);
    // TODO Convert to evaluate function that diffs a chunk model with what it should look like and adds/removes parts as necesary
    terrainScheduler.queueTask(() => {
        debug.profilebegin('Render Chunk');
        const model = new Instance('Model');
        model.Name = vectorName(chunkPosition);

        iterateInVectorRange(
            chunkPositionToVoxelPosition(chunkPosition),
            chunkPositionToVoxelPosition(chunkPosition).add(Vector3.one.mul(GlobalSettings.chunkSize)),
            (voxelPosition) => {
                const voxel = chunk.voxels?.vectorGet(voxelPositionToVoxelOffset(voxelPosition));
                if (voxel === undefined || voxel === 0) return;
                const neighborsFull = eightNeighborOffsets.map((offset) => getVoxel(voxelPosition.add(offset)) !== 0);
                const emptyNeighbor = neighborsFull.includes(false);
                if (emptyNeighbor) {
                    createVoxel(voxelPositionToWorldPosition(voxelPosition), voxel, model);
                }
            }
        );

        if (model.GetChildren().size() > 0) {
            model.WorldPivot = new CFrame(chunkPositionToWorldPosition(chunkPosition));
            model.Parent = chunkFolder;
            renderedChunkModelCount++;
        } else {
            model.Destroy();
        }

        renderedChunks.vectorSet(chunkPosition, true);
        renderingChunks.vectorDelete(chunkPosition);
        debug.profileend();
    });
}

let pendingGarbageCollection = 0;

function maybeCollectGarbage() {
    const target = math.min(
        GlobalSettings.garbageCollectionIncrement,
        renderedChunkModelCount - pendingGarbageCollection - GlobalSettings.garbageTriggerChunkCount
    );

    if (target <= 0) return;
    pendingGarbageCollection += target;
    terrainScheduler.queueTask(() => {
        debug.profilebegin('Collect Garbage');
        const charPosition = characterPosition();
        const chunkDistances = [];
        const chunkDistanceMap = new Map<number, Model>();
        for (const chunk of chunkFolder.GetChildren()) {
            const distance = charPosition.sub((chunk as Model).WorldPivot.Position).Magnitude;
            chunkDistances.push(distance);
            chunkDistanceMap.set(distance, chunk as Model);
        }
        chunkDistances.sort();
        for (let i = target; i > 0; i--) {
            const chunk = chunkDistanceMap.get(chunkDistances.pop() ?? -1);
            if (!chunk) break;
            chunk.GetChildren().forEach((voxel) => {
                voxel.Parent = recyclingFolder;
                recycledVoxels.push(voxel as Part);
            });
            chunk.Destroy();
            const chunkCords = chunk.Name.split(',').map((cord) => tonumber(cord)!);
            renderedChunks.vectorDelete(new Vector3(chunkCords[0], chunkCords[1], chunkCords[2]));
            renderedChunkModelCount--;
        }
        pendingGarbageCollection -= target;
        debug.profileend();
    });
}

game.GetService('RunService').Stepped.Connect((t, deltaT) => {
    if (!rootPart) return;

    const chunkPos = characterAtChunk();

    manhattanSpread(GlobalSettings.shownRadius + 1, (offset) => {
        fetchChunk(chunkPos.add(offset));
    });

    manhattanSpread(GlobalSettings.shownRadius, (offset) => {
        createChunk(chunkPos.add(offset));
    });

    maybeCollectGarbage();
});
