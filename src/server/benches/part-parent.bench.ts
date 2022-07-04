import { Profiler } from './profilter';

const ReplicatedStorage = game.GetService('ReplicatedStorage');

const RecylcingFolder =
    game.Workspace.FindFirstChild('RecylcingBin') ||
    (() => {
        const fold = new Instance('Folder');
        fold.Name = 'RecylcingBin';
        fold.Parent = game.Workspace;
        return fold;
    })();

const ReplicatedStorageRecyclingFolder =
    ReplicatedStorage.FindFirstChild('RecylcingBin') ||
    (() => {
        const fold = new Instance('Folder');
        fold.Name = 'RecylcingBin';
        fold.Parent = ReplicatedStorage;
        return fold;
    })();

const model =
    game.Workspace.FindFirstChild('BenchmarkModel') ||
    (() => {
        const fold = new Instance('Model');
        fold.Name = 'BenchmarkModel';
        fold.Parent = game.Workspace;
        return fold;
    })();

let part: Part =
    (model.FindFirstChild('Part') as Part) ||
    (() => {
        const p = new Instance('Part');
        p.Parent = model;
        p.Size = new Vector3(3, 3, 3);
        return p;
    })();

export = {
    ParameterGenerator: () => {
        return 100 * math.random();
    },

    Functions: {
        A: (Profiler: Profiler, RandomNumber: number) => {
            part.Destroy();

            part = new Instance('Part');
            part.Size = new Vector3(3, 3, 3);
            part.Position = new Vector3(0, RandomNumber, 0);
            part.Parent = model;
        },

        B: (Profiler: Profiler, RandomNumber: number) => {
            part.Parent = ReplicatedStorage;

            part.Position = new Vector3(0, RandomNumber, 0);
            part.Parent = model;
        },

        C: (Profiler: Profiler, RandomNumber: number) => {
            part.Parent = RecylcingFolder;

            part.Position = new Vector3(0, RandomNumber, 0);
            part.Parent = model;
        },

        D: (Profiler: Profiler, RandomNumber: number) => {
            part.Parent = undefined;

            part.Position = new Vector3(0, RandomNumber, 0);
            part.Parent = model;
        },

        E: (Profiler: Profiler, RandomNumber: number) => {
            part.Parent = ReplicatedStorageRecyclingFolder;

            part.Position = new Vector3(0, RandomNumber, 0);
            part.Parent = model;
        }
    }
};
