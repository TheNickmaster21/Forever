import { GlobalSettings, ReplicationFunction } from 'shared/module';

import { CrochetServer } from '@rbxts/crochet';

const seed = os.time();

const voxels: number[][] = [];
const voxelFolder = new Instance('Folder');
voxelFolder.Name = 'Voxels';
voxelFolder.Parent = game.Workspace;

CrochetServer.registerRemoteFunction(ReplicationFunction);
CrochetServer.bindServerSideRemoteFunction(ReplicationFunction, (player, x, z) => {
    if (voxels[x] === undefined) {
        voxels[x] = [];
    }

    if (voxels[x][z] === undefined) {
        voxels[x][z] =
            GlobalSettings.worldHeight * math.noise(x / 10, z / 10, seed) +
            (GlobalSettings.worldHeight * math.noise(x / 15, z / 15, seed + 100)) / 2;
    }

    return voxels[x][z];
});

CrochetServer.start();
