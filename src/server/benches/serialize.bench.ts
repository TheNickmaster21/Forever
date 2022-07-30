import { BlockType } from 'shared/block';
import { Chunk } from 'shared/chunk';
import { GlobalSettings } from 'shared/global-settings';
import { Simple3DArray } from 'shared/simple-3d-array';
import { Profiler } from './profilter';

const iterations = 5;

const inputChunk = {
    empty: false,
    voxels: new Simple3DArray<BlockType>()
};

for (let voxelX = 0; voxelX < GlobalSettings.chunkSize; voxelX++) {
    for (let voxelY = 0; voxelY < GlobalSettings.chunkSize; voxelY++) {
        for (let voxelZ = 0; voxelZ < GlobalSettings.chunkSize; voxelZ++) {
            inputChunk.voxels.set(voxelX, voxelY, voxelZ, voxelY > 2 ? ((voxelX % 5) as BlockType) : 0);
        }
    }
}

const httpService = game.GetService('HttpService');

interface RawChunk {
    empty: boolean;
    voxels?: BlockType[][][];
}

function chunkFromRawChunk(rawChunk: RawChunk): Chunk {
    return {
        ...rawChunk,
        voxels: rawChunk.voxels ? new Simple3DArray(rawChunk.voxels) : undefined
    };
}

function rawChunkFromChunk(chunk: Chunk): RawChunk {
    return {
        ...chunk,
        voxels: chunk.voxels?.raw()
    };
}

interface RawChunk2 {
    empty: boolean;
    voxels?: string;
}

function chunkFromRawChunk2(rawChunk: RawChunk2): Chunk {
    let voxels: BlockType[][][] | undefined;
    if (rawChunk.voxels !== undefined) {
        voxels = [];
        let index = 0;
        for (const char of rawChunk.voxels) {
            const [x, y, z] = [math.floor(index / (16 * 16)) % 16, math.floor(index / 16) % 16, index % 16];
            if (y === 0 && z === 0) voxels[x] = [];
            if (z === 0) voxels[x][y] = [];
            voxels[x][y][z] = (string.byte(char)[0] - 35) as BlockType;
            index++;
        }
    }

    return {
        ...rawChunk,
        voxels: voxels !== undefined ? new Simple3DArray(voxels) : undefined
    };
}

function rawChunkFromChunk2(chunk: Chunk): RawChunk2 {
    let voxels: string | undefined;
    if (chunk.voxels !== undefined) {
        const flatVoxelArray = [];
        for (const arrX of chunk.voxels.raw()) {
            for (const arrY of arrX) {
                for (const v of arrY) {
                    flatVoxelArray.push(v + 35);
                }
            }
        }
        voxels = string.char(...flatVoxelArray);
    }

    return {
        ...chunk,
        voxels
    };
}

// Benchmark functions to be used with
// https://devforum.roblox.com/t/benchmarker-plugin-compare-function-speeds-with-graphs-percentiles-and-more/829912
export = {
    ParameterGenerator: () => {
        // This function is called before running your function (outside the timer)
        // and the return(s) are passed into your function arguments (after the Profiler). This sample
        // will pass the function a random number, but you can make it pass
        // arrays, Vector3s, or anything else you want to test your function on.
        return math.random(10) * 100;
    },

    Functions: {
        A: (Profiler: Profiler, RandomNumber: number) => {
            for (let i = 0; i < iterations; i++) {
                const compressed = rawChunkFromChunk(inputChunk);
                // print(httpService.JSONEncode(compressed).size()); // 8762
                const result = chunkFromRawChunk(compressed);
            }
        },

        B: (Profiler: Profiler, RandomNumber: number) => {
            for (let i = 0; i < iterations; i++) {
                const compressed = rawChunkFromChunk2(inputChunk);
                // print(httpService.JSONEncode(compressed).size()); // 4123
                // print(httpService.JSONEncode(compressed));
                const result = chunkFromRawChunk2(compressed);
            }
        }
    }
};
