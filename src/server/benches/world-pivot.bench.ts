import { Profiler } from './profilter';

const gridWidth = 16;

function createGird(): Model {
    const model = new Instance('Model');
    for (let x = 0; x < gridWidth; x++) {
        for (let y = 0; y < gridWidth; y++) {
            const part = new Instance('Part');
            part.Size = Vector3.one;
            part.Position = new Vector3(x, y, 0);
            part.Parent = model;
        }
    }

    return model;
}

const pivotChecks = 2000;

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
            const model = createGird();

            for (let i = 0; i < pivotChecks; i++) {
                const a = model.WorldPivot;
            }

            model.Destroy();
        },

        B: (Profiler: Profiler, RandomNumber: number) => {
            const model = createGird();
            model.WorldPivot = new CFrame();

            for (let i = 0; i < pivotChecks; i++) {
                const a = model.WorldPivot;
            }

            model.Destroy();
        },

        C: (Profiler: Profiler, RandomNumber: number) => {
            const model = createGird();
            model.PrimaryPart = model.GetChildren()[0] as Part;

            for (let i = 0; i < pivotChecks; i++) {
                const a = model.WorldPivot;
            }

            model.Destroy();
        }
    }
};
