import { CrochetServer } from '@rbxts/crochet';
import { Chunk } from 'shared/chunk';
import { ReplicationEvent } from 'shared/events';
import { GlobalSettings } from 'shared/global-settings';
import { Simple3DArray } from 'shared/simple-3d-array';

const seed = os.time();

const chunks = new Simple3DArray<Chunk>();

const voxelFolder = new Instance('Folder');
voxelFolder.Name = 'Voxels';
voxelFolder.Parent = game.Workspace;

function getVoxel(x: number, y: number, z: number): boolean {
    let height = 10 * math.noise(x / 100, z / 100, seed);
    height += 5 * math.noise(x / 15, z / 15, seed + 100);

    return y < height;
}

function getChunk(chunkX: number, chunkY: number, chunkZ: number): Chunk {
    let chunk = chunks.get(chunkX, chunkY, chunkZ);
    if (chunk !== undefined) return chunk;
    chunk = new Simple3DArray();

    for (let voxelX = 0; voxelX < GlobalSettings.chunkSize; voxelX++) {
        for (let voxelY = 0; voxelY < GlobalSettings.chunkSize; voxelY++) {
            for (let voxelZ = 0; voxelZ < GlobalSettings.chunkSize; voxelZ++) {
                chunk.set(
                    voxelX,
                    voxelY,
                    voxelZ,
                    getVoxel(
                        chunkX * GlobalSettings.chunkSize + voxelX,
                        chunkY * GlobalSettings.chunkSize + voxelY,
                        chunkZ * GlobalSettings.chunkSize + voxelZ
                    )
                );
            }
        }
    }

    return chunk;
}

CrochetServer.registerRemoteEvent(ReplicationEvent);
const replicate = CrochetServer.getRemoteEventFunction(ReplicationEvent);
CrochetServer.bindRemoteEvent(ReplicationEvent, (player, x, y, z) => {
    task.spawn(() => {
        const chunk = getChunk(x, y, z);
        replicate(player, x, y, z, chunk.raw());
    });
});

CrochetServer.start();
