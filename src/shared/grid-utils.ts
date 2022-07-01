import { Simple3DArray } from './simple-3d-array';

const flat3DNeighborOffsets = [
    [1, 0, 0],
    [-1, 0, 0],
    [0, 1, 0],
    [0, -1, 0],
    [0, 0, 1],
    [0, 0, -1]
];

export function flat3DNeighborFunction<T, I>(
    simple3dArray: Simple3DArray<I>,
    x: number,
    y: number,
    z: number,
    func: (neighbor: I | undefined) => T
): T[] {
    const results: T[] = [];

    flat3DNeighborOffsets.forEach((offset) => {
        results.push(func(simple3dArray.get(x + offset[0], y + offset[1], z + offset[2])));
    });

    return results;
}
