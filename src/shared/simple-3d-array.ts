export class Simple3DArray<V> {
    private array: V[][][];

    constructor(initialArray?: V[][][]) {
        this.array = initialArray ?? [];
    }

    public set(keyX: number, keyY: number, keyZ: number, value: V): void {
        this.checkAndCreateKeyXAndKeyY(keyX, keyY);
        this.array[keyX][keyY][keyZ] = value;
    }

    public vectorSet(vector: Vector3, value: V): void {
        this.checkAndCreateForVector(vector);
        this.array[vector.X][vector.Y][vector.Z] = value;
    }

    public delete(keyX: number, keyY: number, keyZ: number): void {
        this.checkAndCreateKeyXAndKeyY(keyX, keyY);
        delete this.array[keyX][keyY][keyZ];
    }

    public vectorDelete(vector: Vector3): void {
        this.checkAndCreateForVector(vector);
        delete this.array[vector.X][vector.Y][vector.Z];
    }

    public clear(): void {
        this.array = [];
    }

    public get(keyX: number, keyY: number, keyZ: number): V | undefined {
        this.checkAndCreateKeyXAndKeyY(keyX, keyY);
        return this.array[keyX][keyY][keyZ];
    }

    public vectorGet(vector: Vector3): V | undefined {
        this.checkAndCreateForVector(vector);
        return this.array[vector.X][vector.Y][vector.Z];
    }

    public has(keyX: number, keyY: number, keyZ: number): boolean {
        this.checkAndCreateKeyXAndKeyY(keyX, keyY);
        return this.array[keyX][keyY][keyZ] !== undefined;
    }

    public vectorHas(vector: Vector3): boolean {
        this.checkAndCreateForVector(vector);
        return this.array[vector.X][vector.Y][vector.Z] !== undefined;
    }

    public raw(): V[][][] {
        return this.array;
    }

    private checkAndCreateKeyXAndKeyY(keyX: number, keyY: number): void {
        if (this.array[keyX] === undefined) {
            this.array[keyX] = [];
            this.array[keyX][keyY] = [];
        } else if (this.array[keyX][keyY] === undefined) {
            this.array[keyX][keyY] = [];
        }
    }

    private checkAndCreateForVector(vector: Vector3): void {
        if (this.array[vector.X] === undefined) {
            this.array[vector.X] = [];
            this.array[vector.X][vector.Y] = [];
        } else if (this.array[vector.X][vector.Y] === undefined) {
            this.array[vector.X][vector.Y] = [];
        }
    }
}
