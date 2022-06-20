import { GlobalSettings, ReplicationEvent } from 'shared/module';

import { CrochetClient } from '@rbxts/crochet';

CrochetClient.start().await();

const player = game.GetService('Players').LocalPlayer;
const character = player.Character ?? player.CharacterAdded.Wait()[0];

const knownVoxels: number[][] = [];

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

const fetchingVoxels: boolean[][] = [];

const replicationEventFunction = CrochetClient.getRemoteEventFunction(ReplicationEvent);

function getVoxel(x: number, z: number) {
    if (!fetchingVoxels[x]) {
        fetchingVoxels[x] = [];
    }

    if (fetchingVoxels[x][z]) {
        return;
    }

    fetchingVoxels[x][z] = true;

    replicationEventFunction(x, z);
}

CrochetClient.bindRemoteEvent(ReplicationEvent, (x, z, value) => {
    if (value === undefined) {
        return;
    }

    if (!knownVoxels[x]) {
        knownVoxels[x] = [];
    }

    knownVoxels[x][z] = value;
});

function voxelName(x: number, z: number): string {
    return x + ',' + z;
}

function createVoxel(x: number, z: number) {
    const voxel = new Instance('Part');
    voxel.Name = voxelName(x, z);
    voxel.Size = new Vector3(GlobalSettings.gridWidth, GlobalSettings.worldHeightIncrement, GlobalSettings.gridWidth);
    voxel.TopSurface = Enum.SurfaceType.Smooth;
    voxel.BottomSurface = Enum.SurfaceType.Smooth;
    voxel.BrickColor = BrickColor.random();
    voxel.Anchored = true;
    voxel.Position = new Vector3(
        x * GlobalSettings.gridWidth,
        knownVoxels[x][z] - GlobalSettings.gridHeight / 2,
        z * GlobalSettings.gridWidth
    );
    voxel.Parent = voxelFolder;
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
            GlobalSettings.idealShownSize * GlobalSettings.gridWidth
        ) {
            voxel.Destroy();
            if (++collected > target) {
                return;
            }
        }
    }
}

game.GetService('RunService').Stepped.Connect((t, deltaT) => {
    const [middleX, middleZ] = characterAtGrid();
    for (let x = middleX - GlobalSettings.minShownSize / 2; x <= middleX + GlobalSettings.minShownSize / 2; x++) {
        for (let z = middleZ - GlobalSettings.minShownSize / 2; z <= middleZ + GlobalSettings.minShownSize / 2; z++) {
            task.spawn(getVoxel, x, z);
        }
    }

    for (let x = middleX - GlobalSettings.minShownSize / 2; x <= middleX + GlobalSettings.minShownSize / 2; x++) {
        for (let z = middleZ - GlobalSettings.minShownSize / 2; z <= middleZ + GlobalSettings.minShownSize / 2; z++) {
            if (knownVoxels[x] && knownVoxels[x][z] !== undefined && !voxelFolder.FindFirstChild(voxelName(x, z))) {
                createVoxel(x, z);
            }
        }
    }

    if (voxelFolder.GetChildren().size() > GlobalSettings.garbageTriggerPartCount) {
        task.spawn(collectGarbage);
    }
});
