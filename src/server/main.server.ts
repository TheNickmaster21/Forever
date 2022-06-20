import { CrochetServer } from '@rbxts/crochet';
import { Simple2DArray } from 'shared/simple-2d-array';
import { Chunk } from 'shared/chunk';
import { ReplicationEvent } from 'shared/events';
import { GlobalSettings } from 'shared/global-settings';

const seed = os.time();

const chunks = new Simple2DArray<Chunk>();

const voxelFolder = new Instance('Folder');
voxelFolder.Name = 'Voxels';
voxelFolder.Parent = game.Workspace;

function getVoxel(x: number, z: number): number {
    let height = GlobalSettings.worldHeight * math.noise(x / 10, z / 10, seed);
    height += (GlobalSettings.worldHeight * math.noise(x / 15, z / 15, seed + 100)) / 2;
    height = math.round(height / GlobalSettings.worldHeightIncrement) * GlobalSettings.worldHeightIncrement;

    return height;
}

function getChunk(chunkX: number, chunkZ: number): Chunk {
    let chunk = chunks.get(chunkX, chunkZ);
    if (chunk !== undefined) return chunk;
    chunk = new Simple2DArray();

    for (let voxelX = 0; voxelX < GlobalSettings.chunkWidth; voxelX++) {
        for (let voxelZ = 0; voxelZ < GlobalSettings.chunkWidth; voxelZ++) {
            chunk.set(
                voxelX,
                voxelZ,
                getVoxel(chunkX * GlobalSettings.chunkWidth + voxelX, chunkZ * GlobalSettings.chunkWidth + voxelZ)
            );
        }
    }

    return chunk;
}

CrochetServer.registerRemoteEvent(ReplicationEvent);
const replicate = CrochetServer.getRemoteEventFunction(ReplicationEvent);
CrochetServer.bindRemoteEvent(ReplicationEvent, (player, x, z) => {
    task.spawn(() => {
        const chunk = getChunk(x, z);
        replicate(player, x, z, chunk.raw());
    });
});

CrochetServer.start();
