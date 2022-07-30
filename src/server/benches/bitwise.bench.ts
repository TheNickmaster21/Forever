import { Profiler } from './profilter';

const iterations = 50;

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
                const [x, y, z] = [10, 255, 165];

                const arr = [x, y, z];

                const a = arr[0];
                const b = arr[1];
                const c = arr[2];
            }
        },

        B: (Profiler: Profiler, RandomNumber: number) => {
            for (let i = 0; i < iterations; i++) {
                const [x, y, z] = [10, 255, 165];

                const n = x * 65536 + y * 256 + z;

                const a = math.floor(n / 65536) % 256;
                const b = math.floor(n / 256) % 256;
                const c = n % 256;
            }
        },

        C: (Profiler: Profiler, RandomNumber: number) => {
            for (let i = 0; i < iterations; i++) {
                const [x, y, z] = [10, 255, 165];

                const n = bit32.lshift(x, 16) + bit32.lshift(y, 8) + z;

                const a = bit32.rshift(n, 16) & 255;
                const b = bit32.rshift(n, 8) & 255;
                const c = n & 255;
            }
        },

        D: (Profiler: Profiler, RandomNumber: number) => {
            for (let i = 0; i < iterations; i++) {
                const [x, y, z] = [10, 255, 165];

                const char = string.char(x) + string.char(y) + string.char(z);
                const arr = char.split('').map((char) => string.byte(char));

                const a = arr[0];
                const b = arr[1];
                const c = arr[2];
            }
        },

        E: (Profiler: Profiler, RandomNumber: number) => {
            for (let i = 0; i < iterations; i++) {
                const [x, y, z] = [10, 255, 165];

                const char = string.char(x) + string.char(y) + string.char(z);
                const arr = char.split('');

                const [a] = string.byte(arr[0]);
                const [b] = string.byte(arr[1]);
                const [c] = string.byte(arr[2]);
            }
        },

        F: (Profiler: Profiler, RandomNumber: number) => {
            for (let i = 0; i < iterations; i++) {
                const [x, y, z] = [10, 255, 165];

                const char = `${string.char(x)}${string.char(y)}${string.char(z)}`;
                const arr = char.split('');

                const [a] = string.byte(arr[0]);
                const [b] = string.byte(arr[1]);
                const [c] = string.byte(arr[2]);
            }
        }

        // Incredibly slow
        // E: (Profiler: Profiler, RandomNumber: number) => {
        //     for (let i = 0; i < iterations; i++) {
        //         const [x, y, z] = [10, 255, 165];

        //         const char = string.char(x) + string.char(y) + string.char(z);

        //         const [a] = string.byte(char.sub(1, 1));
        //         const [b] = string.byte(char.sub(2, 2));
        //         const [c] = string.byte(char.sub(3, 3));

        //         print(a, b, c);
        //     }
        // }
    }
};
