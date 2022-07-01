import { Simple3DArray } from './simple-3d-array';

const flat3DNeighborOffsets = [
    new Vector3(1, 0, 0),
    new Vector3(-1, 0, 0),
    new Vector3(0, 1, 0),
    new Vector3(0, -1, 0),
    new Vector3(0, 0, 1),
    new Vector3(0, 0, -1)
];

export function flat3DNeighborFunction<T, I>(
    simple3dArray: Simple3DArray<I>,
    vector: Vector3,
    func: (neighbor: I | undefined) => T
): T[] {
    const results: T[] = [];

    flat3DNeighborOffsets.forEach((offset) => {
        results.push(func(simple3dArray.vectorGet(vector.add(offset))));
    });

    return results;
}

export function iterateInVectorRange(
    lowerVector: Vector3,
    upperVector: Vector3,
    iterationFunction: (vector: Vector3) => void
): void {
    for (let x = lowerVector.X; x < upperVector.X; x++) {
        for (let y = lowerVector.Y; y < upperVector.Y; y++) {
            for (let z = lowerVector.Z; z < upperVector.Z; z++) {
                iterationFunction(new Vector3(x, y, z));
            }
        }
    }
}
