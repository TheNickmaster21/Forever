import { GlobalSettings, ReplicationEvent } from 'shared/module';

import { CrochetServer } from '@rbxts/crochet';

const seed = os.time();

const voxels: number[][] = [];
const voxelFolder = new Instance('Folder');
voxelFolder.Name = 'Voxels';
voxelFolder.Parent = game.Workspace;

function getVoxel(x: number, z: number): number {
    if (voxels[x] === undefined) {
        voxels[x] = [];
    }

    if (voxels[x][z] === undefined) {
        voxels[x][z] =
            GlobalSettings.worldHeight * math.noise(x / 10, z / 10, seed) +
            (GlobalSettings.worldHeight * math.noise(x / 15, z / 15, seed + 100)) / 2;
    }

    return voxels[x][z];
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
