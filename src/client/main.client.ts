import { CrochetClient } from '@rbxts/crochet';
import { Chunk } from 'shared/chunk';
import { ReplicationEvent } from 'shared/events';
import { GlobalSettings } from 'shared/global-settings';
import { Simple3DArray } from 'shared/simple-3d-array';

CrochetClient.start().await();

const player = game.GetService('Players').LocalPlayer;
const character = player.Character ?? player.CharacterAdded.Wait()[0];
const rootPart = character.WaitForChild('HumanoidRootPart') as Part;

// TODO Rename
const voxelFolder = game.Workspace.WaitForChild('Voxels');

function characterPosition() {
    return rootPart.Position;
}

function characterAtGrid(): [number, number, number] {
    const charPos = characterPosition();
    const middleX = math.round(charPos.X / GlobalSettings.voxelSize);
    const middleY = math.round(charPos.Y / GlobalSettings.voxelSize);
    const middleZ = math.round(charPos.Z / GlobalSettings.voxelSize);

    return [middleX, middleY, middleZ];
}

function characterAtChunk(): [number, number, number] {
    const [gridX, gridY, gridZ] = characterAtGrid();

    return [
        math.round(gridX / GlobalSettings.chunkSize),
        math.round(gridY / GlobalSettings.chunkSize),
        math.round(gridZ / GlobalSettings.chunkSize)
    ];
}

const fetchingChunks = new Simple3DArray<boolean>();

const replicationEventFunction = CrochetClient.getRemoteEventFunction(ReplicationEvent);

function fetchChunk(x: number, y: number, z: number) {
    if (fetchingChunks.get(x, y, z)) {
        return;
    }

    fetchingChunks.set(x, y, z, true);
    print(`fetching ${x}, ${y}, ${z}`);
    replicationEventFunction(x, y, z);
}

const knownChunks = new Simple3DArray<Chunk>();

CrochetClient.bindRemoteEvent(ReplicationEvent, (x, y, z, value) => {
    if (value === undefined) {
        return;
    }

    knownChunks.set(x, y, z, new Simple3DArray(value));
});

function voxelName(x: number, y: number, z: number): string {
    return `${x},${y},${z}`;
}

function createVoxel(x: number, y: number, z: number, parent: Model) {
    const voxel = new Instance('Part');
    voxel.Name = voxelName(x, y, z);
    voxel.Size = new Vector3(GlobalSettings.voxelSize, GlobalSettings.voxelSize, GlobalSettings.voxelSize);
    voxel.TopSurface = Enum.SurfaceType.Smooth;
    voxel.BottomSurface = Enum.SurfaceType.Smooth;
    voxel.BrickColor = BrickColor.random();
    voxel.Anchored = true;
    voxel.Position = new Vector3(
        x * GlobalSettings.voxelSize,
        y * GlobalSettings.voxelSize,
        z * GlobalSettings.voxelSize
    );
    voxel.Parent = parent;
}

function createChunk(chunkX: number, chunkY: number, chunkZ: number) {
    const chunk = knownChunks.get(chunkX, chunkY, chunkZ);
    if (chunk === undefined) return;

    const model = new Instance('Model');
    model.Name = voxelName(chunkX, chunkY, chunkZ);

    for (let voxelX = 0; voxelX < GlobalSettings.chunkSize; voxelX++) {
        for (let voxelY = 0; voxelY < GlobalSettings.chunkSize; voxelY++) {
            for (let voxelZ = 0; voxelZ < GlobalSettings.chunkSize; voxelZ++) {
                if (chunk.get(voxelX, voxelY, voxelZ)) {
                    createVoxel(
                        chunkX * GlobalSettings.chunkSize + voxelX,
                        chunkY * GlobalSettings.chunkSize + voxelY,
                        chunkZ * GlobalSettings.chunkSize + voxelZ,
                        model
                    );
                }
            }
        }
    }

    model.Parent = voxelFolder;
}

function collectGarbage() {
    const charPos = characterPosition();
    const chunks = voxelFolder.GetChildren();
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
    const [middleX, middleY, middleZ] = characterAtChunk();

    for (
        let x = math.floor(middleX - GlobalSettings.shownSize / 2);
        x <= math.ceil(middleX + GlobalSettings.shownSize / 2);
        x++
    ) {
        for (
            let y = math.floor(middleY - GlobalSettings.shownSize / 2);
            y <= math.ceil(middleY + GlobalSettings.shownSize / 2);
            y++
        ) {
            for (
                let z = math.floor(middleZ - GlobalSettings.shownSize / 2);
                z <= math.ceil(middleZ + GlobalSettings.shownSize / 2);
                z++
            ) {
                task.spawn(fetchChunk, x, y, z);
            }
        }
    }

    for (
        let x = math.floor(middleX - GlobalSettings.shownSize / 2);
        x <= math.ceil(middleX + GlobalSettings.shownSize / 2);
        x++
    ) {
        for (
            let y = math.floor(middleY - GlobalSettings.shownSize / 2);
            y <= math.ceil(middleY + GlobalSettings.shownSize / 2);
            y++
        ) {
            for (
                let z = math.floor(middleZ - GlobalSettings.shownSize / 2);
                z <= math.ceil(middleZ + GlobalSettings.shownSize / 2);
                z++
            ) {
                if (!voxelFolder.FindFirstChild(voxelName(x, y, z))) {
                    createChunk(x, y, z);
                }
            }
        }
    }

    if (voxelFolder.GetChildren().size() > GlobalSettings.garbageTriggerChunkCount) {
        task.spawn(collectGarbage);
    }
});
