import { CrochetClient } from '@rbxts/crochet';
import { Chunk } from 'shared/chunk';
import { ReplicationEvent } from 'shared/events';
import { GlobalSettings } from 'shared/global-settings';
import { Simple2DArray } from 'shared/simple-2d-array';

CrochetClient.start().await();

const player = game.GetService('Players').LocalPlayer;
const character = player.Character ?? player.CharacterAdded.Wait()[0];

// TODO Rename
const voxelFolder = game.Workspace.WaitForChild('Voxels');

function characterPosition() {
    return (character.WaitForChild('HumanoidRootPart') as Part).Position;
}

function characterAtGrid(): [number, number] {
    const charPos = characterPosition();
    const middleX = math.round(charPos.X / GlobalSettings.gridWidth);
    const middleZ = math.round(charPos.Z / GlobalSettings.gridWidth);

    return [middleX, middleZ];
}

function characterAtChunk(): [number, number] {
    const [gridX, gridZ] = characterAtGrid();

    return [math.round(gridX / GlobalSettings.chunkWidth), math.round(gridZ / GlobalSettings.chunkWidth)];
}

const fetchingChunks = new Simple2DArray<boolean>();

const replicationEventFunction = CrochetClient.getRemoteEventFunction(ReplicationEvent);

function fetchChunk(x: number, z: number) {
    if (fetchingChunks.get(x, z)) {
        return;
    }

    fetchingChunks.set(x, z, true);
    print(`fetch ${x}, ${z}`);
    replicationEventFunction(x, z);
}

const knownChunks = new Simple2DArray<Chunk>();

CrochetClient.bindRemoteEvent(ReplicationEvent, (x, z, value) => {
    if (value === undefined) {
        return;
    }

    knownChunks.set(x, z, new Simple2DArray(value));
});

function voxelName(x: number, z: number): string {
    return x + ',' + z;
}

function createVoxel(x: number, z: number, height: number, parent: Model) {
    const voxel = new Instance('Part');
    voxel.Name = voxelName(x, z);
    voxel.Size = new Vector3(GlobalSettings.gridWidth, GlobalSettings.worldHeightIncrement, GlobalSettings.gridWidth);
    voxel.TopSurface = Enum.SurfaceType.Smooth;
    voxel.BottomSurface = Enum.SurfaceType.Smooth;
    voxel.BrickColor = BrickColor.random();
    voxel.Anchored = true;
    voxel.Position = new Vector3(
        x * GlobalSettings.gridWidth,
        height - GlobalSettings.gridHeight / 2,
        z * GlobalSettings.gridWidth
    );
    voxel.Parent = parent;
}

function createChunk(chunkX: number, chunkZ: number) {
    const chunk = knownChunks.get(chunkX, chunkZ);
    if (chunk === undefined) return;

    const model = new Instance('Model');
    model.Name = voxelName(chunkX, chunkZ);

    for (let voxelX = 0; voxelX < GlobalSettings.chunkWidth; voxelX++) {
        for (let voxelZ = 0; voxelZ < GlobalSettings.chunkWidth; voxelZ++) {
            createVoxel(
                chunkX * GlobalSettings.chunkWidth + voxelX,
                chunkZ * GlobalSettings.chunkWidth + voxelZ,
                // If this is undefined, something is totally wrong with our chunks
                chunk.get(voxelX, voxelZ)!,
                model
            );
        }
    }

    model.Parent = voxelFolder;
}

function collectGarbage() {
    const charPos = characterPosition();
    const voxels = voxelFolder.GetChildren();
    const target = math.min(
        GlobalSettings.garbageCollectionIncrement,
        voxels.size() - GlobalSettings.garbageTriggerPartCount
    );
    print("It's garbin time!", target);
    let collected = 0;
    for (const voxel of voxels) {
        if (
            charPos.sub((voxel as Part).Position).Magnitude >
            GlobalSettings.idealShownSize * GlobalSettings.chunkWidth * GlobalSettings.gridWidth
        ) {
            voxel.Destroy();
            if (++collected > target) {
                return;
            }
        }
    }
}

game.GetService('RunService').Stepped.Connect((t, deltaT) => {
    const [middleX, middleZ] = characterAtChunk();

    for (
        let x = math.floor(middleX - GlobalSettings.minShownSize / 2);
        x <= math.ceil(middleX + GlobalSettings.minShownSize / 2);
        x++
    ) {
        for (
            let z = math.floor(middleZ - GlobalSettings.minShownSize / 2);
            z <= math.ceil(middleZ + GlobalSettings.minShownSize / 2);
            z++
        ) {
            task.spawn(fetchChunk, x, z);
        }
    }

    for (
        let x = math.floor(middleX - GlobalSettings.minShownSize / 2);
        x <= math.ceil(middleX + GlobalSettings.minShownSize / 2);
        x++
    ) {
        for (
            let z = math.floor(middleZ - GlobalSettings.minShownSize / 2);
            z <= math.ceil(middleZ + GlobalSettings.minShownSize / 2);
            z++
        ) {
            if (!voxelFolder.FindFirstChild(voxelName(x, z))) {
                createChunk(x, z);
            }
        }
    }

    if (voxelFolder.GetChildren().size() > GlobalSettings.garbageTriggerPartCount) {
        task.spawn(collectGarbage);
    }
});
