import { Profiler } from './profilter';

const spiralSize = 25;

const spiralVectorOffsets: Vector3[] = [];

for (let x = math.floor(-spiralSize / 2); x <= math.ceil(spiralSize / 2); x++) {
    for (let y = math.floor(-spiralSize / 2); y <= math.ceil(spiralSize / 2); y++) {
        for (let z = math.floor(-spiralSize / 2); z <= math.ceil(spiralSize / 2); z++) {
            spiralVectorOffsets.push(new Vector3(x, y, z));
        }
    }
}

table.sort(spiralVectorOffsets, (a, b) => a.Magnitude < b.Magnitude);

// https://stackoverflow.com/questions/37214057/3d-array-traversal-originating-from-center

export = {
    ParameterGenerator: () => {
        return math.random();
    },

    Functions: {
        A1: (Profiler: Profiler, RandomNumber: number) => {
            function insideOut(n: number, visit: (vector: Vector3) => void) {
                function mirrorEven(x: number, y: number, z: number, visit: (vector: Vector3) => void) {
                    for (let i = 1; i >= 0; --i) {
                        for (let j = 1; j >= 0; --j) {
                            for (let k = 1; k >= 0; --k) {
                                visit(new Vector3(half + x + i, half + y + j, half + z + k));
                                z *= -1;
                            }
                            y *= -1;
                        }
                        x *= -1;
                    }
                }

                function mirrorOdd(x: number, y: number, z: number, visit: (vector: Vector3) => void) {
                    for (let i = 0; i < (x ? 2 : 1); ++i) {
                        for (let j = 0; j < (y ? 2 : 1); ++j) {
                            for (let k = 0; k < (z ? 2 : 1); ++k) {
                                visit(new Vector3(half + x, half + y, half + z));
                                z *= -1;
                            }
                            y *= -1;
                        }
                        x *= -1;
                    }
                }

                const half = math.ceil(n / 2) - 1;
                for (let d = 0; d <= 3 * half; d++) {
                    for (let x = math.max(0, d - 2 * half); x <= math.min(half, d); x++) {
                        for (let y = math.max(0, d - x - half); y <= math.min(half, d - x); y++) {
                            n % 2 ? mirrorOdd(x, y, d - x - y, visit) : mirrorEven(x, y, d - x - y, visit);
                        }
                    }
                }
            }

            let count = 0;
            insideOut(spiralSize, () => {
                count++;
            });
        },

        A2: (Profiler: Profiler, RandomNumber: number) => {
            function mirrorEven(half: number, x: number, y: number, z: number, visit: (vector: Vector3) => void) {
                for (let i = 1; i >= 0; --i) {
                    for (let j = 1; j >= 0; --j) {
                        for (let k = 1; k >= 0; --k) {
                            visit(new Vector3(half + x + i, half + y + j, half + z + k));
                            z *= -1;
                        }
                        y *= -1;
                    }
                    x *= -1;
                }
            }

            function mirrorOdd(half: number, x: number, y: number, z: number, visit: (vector: Vector3) => void) {
                for (let i = 0; i < (x ? 2 : 1); ++i) {
                    for (let j = 0; j < (y ? 2 : 1); ++j) {
                        for (let k = 0; k < (z ? 2 : 1); ++k) {
                            visit(new Vector3(half + x, half + y, half + z));
                            z *= -1;
                        }
                        y *= -1;
                    }
                    x *= -1;
                }
            }

            function insideOut(n: number, visit: (vector: Vector3) => void) {
                const half = math.ceil(n / 2) - 1;
                for (let d = 0; d <= 3 * half; d++) {
                    for (let x = math.max(0, d - 2 * half); x <= math.min(half, d); x++) {
                        for (let y = math.max(0, d - x - half); y <= math.min(half, d - x); y++) {
                            n % 2 ? mirrorOdd(half, x, y, d - x - y, visit) : mirrorEven(half, x, y, d - x - y, visit);
                        }
                    }
                }
            }

            let count = 0;
            insideOut(spiralSize, () => {
                count++;
            });
        },

        B: (Profiler: Profiler, RandomNumber: number) => {
            function insideOut(n: number, visit: (vector: Vector3) => void) {
                const half = (n - 1) / 2;
                for (let d = 0; d <= 3 * half; d++) {
                    const xmin = d < 2 * half ? 0 : d - 2 * half;
                    const xmax = d < half ? d : half;
                    for (let x = xmin; x <= xmax; x++) {
                        const ymin = d < x + half ? 0 : d - x - half;
                        const ymax = d > x + half ? half : d - x;
                        for (let y = ymin; y <= ymax; y++) {
                            if (n % 2) mirrorOdd(x, y, d - x - y, half, visit);
                            else mirrorEven(x, y, d - x - y, half, visit);
                        }
                    }
                }
            }

            function mirrorEven(x: number, y: number, z: number, h: number, visit: (vector: Vector3) => void) {
                visit(new Vector3(h + x + 1, h + y + 1, h + z + 1));
                visit(new Vector3(h + x + 1, h + y + 1, h - z));
                visit(new Vector3(h + x + 1, h - y, h + z + 1));
                visit(new Vector3(h + x + 1, h - y, h - z));
                visit(new Vector3(h - x, h + y + 1, h + z + 1));
                visit(new Vector3(h - x, h + y + 1, h - z));
                visit(new Vector3(h - x, h - y, h + z + 1));
                visit(new Vector3(h - x, h - y, h - z));
            }

            function mirrorOdd(x: number, y: number, z: number, h: number, visit: (vector: Vector3) => void) {
                visit(new Vector3(h + x, h + y, h + z));
                if (z) visit(new Vector3(h + x, h + y, h - z));
                if (y) visit(new Vector3(h + x, h - y, h + z));
                if (y && z) visit(new Vector3(h + x, h - y, h - z));
                if (x) visit(new Vector3(h - x, h + y, h + z));
                if (x && z) visit(new Vector3(h - x, h + y, h - z));
                if (x && y) visit(new Vector3(h - x, h - y, h + z));
                if (x && y && z) visit(new Vector3(h - x, h - y, h - z));
            }

            let count = 0;
            insideOut(spiralSize, () => {
                count++;
            });
        },

        C: (Profiler: Profiler, RandomNumber: number) => {
            function insideOut(n: number, visit: (vector: Vector3) => void) {
                for (let i = 0; i < n * n * n; i++) {
                    visit(spiralVectorOffsets[i]);
                }
            }

            let count = 0;
            insideOut(spiralSize, () => {
                count++;
            });
        }
    }
};
