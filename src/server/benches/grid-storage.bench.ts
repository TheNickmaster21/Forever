import { Profiler } from './profilter';

const gridResolution = 20;

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
        // This doesn't work for negative values
        A: (Profiler: Profiler, RandomNumber: number) => {
            const grid = [];

            for (let x = -gridResolution; x < gridResolution; x++) {
                for (let y = -gridResolution; y < gridResolution; y++) {
                    for (let z = -gridResolution; z < gridResolution; z++) {
                        const vector = new Vector3(x, y, z);
                        grid[x + y * gridResolution + z * gridResolution * gridResolution] = RandomNumber;
                    }
                }
            }

            for (let x = -gridResolution; x < gridResolution; x++) {
                for (let y = -gridResolution; y < gridResolution; y++) {
                    for (let z = -gridResolution; z < gridResolution; z++) {
                        const a = grid[x + y * gridResolution + z * gridResolution * gridResolution];
                    }
                }
            }
        },

        B: (Profiler: Profiler, RandomNumber: number) => {
            const grid: number[][][] = [];

            for (let x = -gridResolution; x < gridResolution; x++) {
                grid[x] = [];
                for (let y = -gridResolution; y < gridResolution; y++) {
                    grid[x][y] = [];
                    for (let z = -gridResolution; z < gridResolution; z++) {
                        const vector = new Vector3(x, y, z);
                        grid[x][y][z] = RandomNumber;
                    }
                }
            }

            for (let x = -gridResolution; x < gridResolution; x++) {
                for (let y = -gridResolution; y < gridResolution; y++) {
                    for (let z = -gridResolution; z < gridResolution; z++) {
                        const a = grid[x][y][z];
                    }
                }
            }
        },

        C: (Profiler: Profiler, RandomNumber: number) => {
            const grid = new Map<Vector3, number>();

            for (let x = -gridResolution; x < gridResolution; x++) {
                for (let y = -gridResolution; y < gridResolution; y++) {
                    for (let z = -gridResolution; z < gridResolution; z++) {
                        const vector = new Vector3(x, y, z);
                        grid.set(vector, RandomNumber);
                    }
                }
            }

            for (let x = -gridResolution; x < gridResolution; x++) {
                for (let y = -gridResolution; y < gridResolution; y++) {
                    for (let z = -gridResolution; z < gridResolution; z++) {
                        const vector = new Vector3(x, y, z);
                        const a = grid.get(vector);
                    }
                }
            }
        },

        D: (Profiler: Profiler, RandomNumber: number) => {
            const grid = new Map<string, number>();

            for (let x = -gridResolution; x < gridResolution; x++) {
                for (let y = -gridResolution; y < gridResolution; y++) {
                    for (let z = -gridResolution; z < gridResolution; z++) {
                        grid.set(x + '|' + y + '|' + z, RandomNumber);
                    }
                }
            }

            for (let x = -gridResolution; x < gridResolution; x++) {
                for (let y = -gridResolution; y < gridResolution; y++) {
                    for (let z = -gridResolution; z < gridResolution; z++) {
                        const a = grid.get(x + '|' + y + '|' + z);
                    }
                }
            }
        },

        E: (Profiler: Profiler, RandomNumber: number) => {
            const grid = new Map<number, number>();

            for (let x = -gridResolution; x < gridResolution; x++) {
                for (let y = -gridResolution; y < gridResolution; y++) {
                    for (let z = -gridResolution; z < gridResolution; z++) {
                        grid.set(bit32.lshift(x, 16) | bit32.lshift(y, 8) | z, RandomNumber);
                    }
                }
            }

            for (let x = -gridResolution; x < gridResolution; x++) {
                for (let y = -gridResolution; y < gridResolution; y++) {
                    for (let z = -gridResolution; z < gridResolution; z++) {
                        const a = grid.get(bit32.lshift(x, 16) | bit32.lshift(y, 8) | z);
                    }
                }
            }
        }
    }
};
