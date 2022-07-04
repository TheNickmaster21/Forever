import { CrochetClient } from '@rbxts/crochet';
import { Chunk, chunkPosToWorldPos, worldPosToChunkOffset, worldPosToChunkPos } from 'shared/chunk';
import { ReplicationEvent } from 'shared/events';
import { GlobalSettings } from 'shared/global-settings';
import { flat3DNeighborFunction, iterateInVectorRange, eightNeighborOffsets } from 'shared/grid-utils';
import { LazyScheduler } from 'shared/lazy-scheduler';
import { manhattanSpread } from 'shared/manhattan-spread';
import { Simple3DArray } from 'shared/simple-3d-array';

CrochetClient.start().await();

const player = game.GetService('Players').LocalPlayer;
let character = player.Character;
let rootPart = character?.WaitForChild('HumanoidRootPart') as Part;
player.CharacterAdded.Connect((char) => {
    character = char;
    rootPart = character?.WaitForChild('HumanoidRootPart') as Part;
});

const chunkFolder = game.Workspace.WaitForChild('Chunks');

const knownChunks = new Simple3DArray<Chunk>();
const fetchingChunks = new Simple3DArray<boolean>();
const renderingChunks = new Simple3DArray<boolean>();
const renderedChunks = new Simple3DArray<boolean>();

function characterPosition() {
    return rootPart.Position;
}

function characterAtGrid(): Vector3 {
    const charPos = characterPosition();

    return new Vector3(
        math.round(charPos.X / GlobalSettings.voxelSize),
        math.round(charPos.Y / GlobalSettings.voxelSize),
        math.round(charPos.Z / GlobalSettings.voxelSize)
    );
}

function characterAtChunk(): Vector3 {
    const gridPosition = characterAtGrid();
    return worldPosToChunkPos(gridPosition);
}

const replicationEventFunction = CrochetClient.getRemoteEventFunction(ReplicationEvent);

function fetchChunk(vector: Vector3): void {
    if (fetchingChunks.vectorGet(vector)) return;

    fetchingChunks.vectorSet(vector, true);
    // print(`fetching ${vectorName(vector)}`);
    replicationEventFunction(vector);
}

CrochetClient.bindRemoteEvent(ReplicationEvent, (vector, value) => {
    if (value === undefined) {
        return;
    }

    knownChunks.vectorSet(vector, new Simple3DArray(value));
});

function vectorName(vector: Vector3): string {
    return `${vector.X},${vector.Y},${vector.Z}`;
}

function createVoxel(worldPos: Vector3, parent: Model) {
    const voxel = new Instance('Part');
    // voxel.Transparency = .8;
    voxel.Name = vectorName(worldPos);
    voxel.Size = new Vector3(GlobalSettings.voxelSize, GlobalSettings.voxelSize, GlobalSettings.voxelSize);
    voxel.TopSurface = Enum.SurfaceType.Smooth;
    voxel.BottomSurface = Enum.SurfaceType.Smooth;
    voxel.BrickColor = BrickColor.random();
    voxel.Anchored = true;
    voxel.Position = worldPos.mul(Vector3.one.mul(GlobalSettings.voxelSize));
    voxel.Parent = parent;
}

function getVoxel(worldPos: Vector3): boolean | undefined {
    const chunk = knownChunks.vectorGet(worldPosToChunkPos(worldPos));
    if (!chunk) return undefined;
    return chunk.vectorGet(worldPosToChunkOffset(worldPos));
}

function createChunk(chunkPos: Vector3) {
    // Avoid double rendering a chunk
    if (renderingChunks.vectorGet(chunkPos) || renderedChunks.vectorGet(chunkPos)) return;

    const chunk = knownChunks.vectorGet(chunkPos);
    const neighborChunksExist = flat3DNeighborFunction(knownChunks, chunkPos, (chunk) => chunk !== undefined);
    const missingNeighbor = neighborChunksExist.includes(false);
    if (chunk === undefined || missingNeighbor) return;
    renderingChunks.vectorSet(chunkPos, true);

    terrainScheduler.queueTask(() => {
        const model = new Instance('Model');
        model.Name = vectorName(chunkPos);

        iterateInVectorRange(
            chunkPosToWorldPos(chunkPos),
            chunkPosToWorldPos(chunkPos).add(Vector3.one.mul(GlobalSettings.chunkSize)),
            (worldPos) => {
                const voxel = chunk.vectorGet(worldPosToChunkOffset(worldPos));
                if (!voxel) return;
                const neighborsFull = eightNeighborOffsets.map((offset) => !!getVoxel(worldPos.add(offset)));
                const emptyNeighbor = neighborsFull.includes(false);
                if (emptyNeighbor) {
                    createVoxel(worldPos, model);
                }
            }
        );

        model.Parent = chunkFolder;
        renderedChunks.vectorSet(chunkPos, true);
        renderingChunks.vectorDelete(chunkPos);
    });
}

function collectGarbage() {
    const charPos = characterPosition();
    const chunks = chunkFolder.GetChildren();
    let target = math.min(
        GlobalSettings.garbageCollectionIncrement,
        chunks.size() - GlobalSettings.garbageTriggerChunkCount
    );
    print("It's garbin time!", chunks.size(), GlobalSettings.garbageTriggerChunkCount, target);
    const chunkDistances = [];
    const chunkDistanceMap = new Map<number, Model>();
    for (const chunk of chunks) {
        const distance = charPos.sub((chunk as Model).WorldPivot.Position).Magnitude;
        chunkDistances.push(distance);
        chunkDistanceMap.set(distance, chunk as Model);
    }
    chunkDistances.sort();
    while (target > 0) {
        const chunk = chunkDistanceMap.get(chunkDistances.pop() ?? 0);
        if (chunk) {
            chunk.Destroy();
            target--;
        } else {
            break;
        }
    }
}

const terrainScheduler = new LazyScheduler();

game.GetService('RunService').Stepped.Connect((t, deltaT) => {
    if (!rootPart) return;

    const chunkPos = characterAtChunk();

    manhattanSpread(GlobalSettings.shownRadius + 1, (offset) => {
        fetchChunk(chunkPos.add(offset));
    });

    manhattanSpread(GlobalSettings.shownRadius, (offset) => {
        createChunk(chunkPos.add(offset));
    });

    if (chunkFolder.GetChildren().size() > GlobalSettings.garbageTriggerChunkCount) {
        task.defer(collectGarbage);
    }
});

terrainScheduler.run();
