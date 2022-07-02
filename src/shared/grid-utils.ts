import { Simple3DArray } from './simple-3d-array';

export const eightNeighborOffsets = [
    new Vector3(1, 0, 0),
    new Vector3(-1, 0, 0),
    new Vector3(0, 1, 0),
    new Vector3(0, -1, 0),
    new Vector3(0, 0, 1),
    new Vector3(0, 0, -1)
] as const;

export function flat3DNeighborFunction<T, I>(
    simple3dArray: Simple3DArray<I>,
    vector: Vector3,
    func: (neighbor: I | undefined) => T
): T[] {
    const results: T[] = [];

    eightNeighborOffsets.forEach((offset) => {
        results.push(func(simple3dArray.vectorGet(vector.add(offset))));
    });

    return results;
}

export function iterateInVectorRange<T>(
    lowerVector: Vector3,
    upperVector: Vector3,
    iterationFunction: (vector: Vector3) => T
): T[] {
    const results = [];

    for (let x = lowerVector.X; x < upperVector.X; x++) {
        for (let y = lowerVector.Y; y < upperVector.Y; y++) {
            for (let z = lowerVector.Z; z < upperVector.Z; z++) {
                results.push(iterationFunction(new Vector3(x, y, z)));
            }
        }
    }

    return results;
}

export function isVectorInBounds(lowerBound: Vector3, upperBound: Vector3, vector: Vector3): boolean {
    return (
        lowerBound.X <= vector.X &&
        vector.X <= upperBound.X &&
        lowerBound.Y <= vector.Y &&
        vector.Y <= upperBound.Y &&
        lowerBound.Z <= vector.Z &&
        vector.Z <= upperBound.Z
    );
}
