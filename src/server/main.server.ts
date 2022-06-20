import { GlobalSettings, ReplicationEvent } from 'shared/module';

import { CrochetServer } from '@rbxts/crochet';
import { Simple2DArray } from 'shared/simple-2d-array';

const seed = os.time();

const voxels = new Simple2DArray<number>();
const voxelFolder = new Instance('Folder');
voxelFolder.Name = 'Voxels';
voxelFolder.Parent = game.Workspace;

function getVoxel(x: number, z: number): number {
    let height = voxels.get(x, z);
    if (height === undefined) {
        height = GlobalSettings.worldHeight * math.noise(x / 10, z / 10, seed);
        height += (GlobalSettings.worldHeight * math.noise(x / 15, z / 15, seed + 100)) / 2;
        height = math.round(height / GlobalSettings.worldHeightIncrement) * GlobalSettings.worldHeightIncrement;
        voxels.set(x, z, height);
    }

    return height;
}

CrochetServer.registerRemoteEvent(ReplicationEvent);
const replicate = CrochetServer.getRemoteEventFunction(ReplicationEvent);
CrochetServer.bindRemoteEvent(ReplicationEvent, (player, x, z) => {
    task.spawn(() => {
        const voxelValue = getVoxel(x, z);
        replicate(player, x, z, voxelValue);
    });
});

CrochetServer.start();
