import { CrochetClient } from '@rbxts/crochet';
import { Chunk, chunkPosToWorldPos, worldPosToChunkOffset, worldPosToChunkPos } from 'shared/chunk';
import { ReplicationEvent } from 'shared/events';
import { GlobalSettings } from 'shared/global-settings';
import { flat3DNeighborFunction, iterateInVectorRange, neighborOffsets } from 'shared/grid-utils';
import { Simple3DArray } from 'shared/simple-3d-array';

CrochetClient.start().await();

const player = game.GetService('Players').LocalPlayer;
const character = player.Character ?? player.CharacterAdded.Wait()[0];
const rootPart = character.WaitForChild('HumanoidRootPart') as Part;

const chunkFolder = game.Workspace.WaitForChild('Chunks');

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

const fetchingChunks = new Simple3DArray<boolean>();

const replicationEventFunction = CrochetClient.getRemoteEventFunction(ReplicationEvent);

function fetchChunk(vector: Vector3): void {
    if (fetchingChunks.vectorGet(vector)) {
        return;
    }

    fetchingChunks.vectorSet(vector, true);
    print(`fetching ${vectorName(vector)}`);
    replicationEventFunction(vector);
}

const knownChunks = new Simple3DArray<Chunk>();

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
    voxel.Transparency = 0.8;
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
    const chunk = knownChunks.vectorGet(chunkPos);
    const neighborChunksExist = flat3DNeighborFunction(knownChunks, chunkPos, (chunk) => chunk !== undefined);
    const missingNeighbor = neighborChunksExist.includes(false);
    if (chunk === undefined || missingNeighbor) return;

    const model = new Instance('Model');
    model.Name = vectorName(chunkPos);

    iterateInVectorRange(
        chunkPosToWorldPos(chunkPos),
        chunkPosToWorldPos(chunkPos).add(Vector3.one.mul(GlobalSettings.chunkSize)),
        (worldPos) => {
            const neighborsFull = neighborOffsets.map((offset) => !!getVoxel(worldPos.add(offset)));
            const emptyNeighbor = neighborsFull.includes(false);
            if (getVoxel(worldPos) && emptyNeighbor) {
                createVoxel(worldPos, model);
            }
        }
    );

    model.Parent = chunkFolder;
}

function collectGarbage() {
    const charPos = characterPosition();
    const chunks = chunkFolder.GetChildren();
    const target = math.min(
        GlobalSettings.garbageCollectionIncrement,
        chunks.size() - GlobalSettings.garbageTriggerChunkCount
    );
    print("It's garbin time!", target);
    let collected = 0;
    const chunkDistances = [];
    const chunkDistanceMap = new Map<number, Model>();
    for (const chunk of chunks) {
        const distance = charPos.sub((chunk as Model).WorldPivot.Position).Magnitude;
        chunkDistances.push(distance);
        chunkDistanceMap.set(distance, chunk as Model);
    }
    chunkDistances.sort();
    for (let distanceIndex = chunkDistances.size() - 1; distanceIndex > -1; distanceIndex--) {
        const chunk = chunkDistanceMap.get(chunkDistances[distanceIndex]);
        if (chunk) {
            chunk.Destroy();
            if (++collected > target) {
                return;
            }
        }
    }
}

game.GetService('RunService').Stepped.Connect((t, deltaT) => {
    const chunkPos = characterAtChunk();

    iterateInVectorRange(
        chunkPos.sub(Vector3.one.mul(GlobalSettings.shownRadius + 1)),
        chunkPos.add(Vector3.one.mul(GlobalSettings.shownRadius + 1)),
        (vector) => task.spawn(fetchChunk, vector)
    );

    iterateInVectorRange(
        chunkPos.sub(Vector3.one.mul(GlobalSettings.shownRadius)),
        chunkPos.add(Vector3.one.mul(GlobalSettings.shownRadius)),
        (vector) => {
            if (!chunkFolder.FindFirstChild(vectorName(vector))) {
                createChunk(vector);
            }
        }
    );

    if (chunkFolder.GetChildren().size() > GlobalSettings.garbageTriggerChunkCount) {
        task.spawn(collectGarbage);
    }
});
