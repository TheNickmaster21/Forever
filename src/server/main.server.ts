import { CrochetServer } from '@rbxts/crochet';
import { Chunk } from 'shared/chunk';
import { ReplicationEvent } from 'shared/events';
import { GlobalSettings } from 'shared/global-settings';
import { LazyScheduler } from 'shared/lazy-scheduler';
import { Simple3DArray } from 'shared/simple-3d-array';

const seed = os.time();

const chunks = new Simple3DArray<Chunk>();

const chunkFolder = new Instance('Folder');
chunkFolder.Name = 'Chunks';
chunkFolder.Parent = game.Workspace;

function createRawVoxel(x: number, y: number, z: number): boolean {
    let height = 10 * math.noise(x / 100, z / 100, seed);
    height += 5 * math.noise(x / 15, z / 15, seed + 100);

    return y < height;
}

function createChunk(chunkPos: Vector3): Chunk {
    const chunk = new Simple3DArray<boolean>();

    for (let voxelX = 0; voxelX < GlobalSettings.chunkSize; voxelX++) {
        for (let voxelY = 0; voxelY < GlobalSettings.chunkSize; voxelY++) {
            for (let voxelZ = 0; voxelZ < GlobalSettings.chunkSize; voxelZ++) {
                chunk.set(
                    voxelX,
                    voxelY,
                    voxelZ,
                    createRawVoxel(
                        chunkPos.X * GlobalSettings.chunkSize + voxelX,
                        chunkPos.Y * GlobalSettings.chunkSize + voxelY,
                        chunkPos.Z * GlobalSettings.chunkSize + voxelZ
                    )
                );
            }
        }
    }

    return chunk;
}

const generationScheduler = new LazyScheduler();

CrochetServer.registerRemoteEvent(ReplicationEvent);
const replicate = CrochetServer.getRemoteEventFunction(ReplicationEvent);
CrochetServer.bindRemoteEvent(ReplicationEvent, (player, chunkPos) => {
    const chunk = chunks.vectorGet(chunkPos);
    if (chunk !== undefined) {
        replicate(player, chunkPos, chunk.raw());
    }

    generationScheduler.queueTask(() => {
        replicate(player, chunkPos, createChunk(chunkPos).raw());
    });
});

CrochetServer.start();
