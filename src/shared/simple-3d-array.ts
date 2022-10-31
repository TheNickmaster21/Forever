export class Simple3DArray<T, V3 extends Vector3 = Vector3> {
    private array: T[][][];

    constructor(initialArray?: T[][][]) {
        this.array = initialArray ?? [];
    }

    public set(keyX: number, keyY: number, keyZ: number, value: T): void {
        this.checkAndCreateKeyXAndKeyY(keyX, keyY);
        this.array[keyX][keyY][keyZ] = value;
    }

    public vectorSet(vector: V3, value: T): void {
        this.checkAndCreateForVector(vector);
        this.array[vector.X][vector.Y][vector.Z] = value;
    }

    public delete(keyX: number, keyY: number, keyZ: number): void {
        this.checkAndCreateKeyXAndKeyY(keyX, keyY);
        delete this.array[keyX][keyY][keyZ];
    }

    public vectorDelete(vector: V3): void {
        this.checkAndCreateForVector(vector);
        delete this.array[vector.X][vector.Y][vector.Z];
    }

    public clear(): void {
        this.array = [];
    }

    public get(keyX: number, keyY: number, keyZ: number): T | undefined {
        this.checkAndCreateKeyXAndKeyY(keyX, keyY);
        return this.array[keyX][keyY][keyZ];
    }

    public vectorGet(vector: V3): T | undefined {
        this.checkAndCreateForVector(vector);
        return this.array[vector.X][vector.Y][vector.Z];
    }

    public has(keyX: number, keyY: number, keyZ: number): boolean {
        this.checkAndCreateKeyXAndKeyY(keyX, keyY);
        return this.array[keyX][keyY][keyZ] !== undefined;
    }

    public vectorHas(vector: V3): boolean {
        this.checkAndCreateForVector(vector);
        return this.array[vector.X][vector.Y][vector.Z] !== undefined;
    }

    public raw(): T[][][] {
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

    private checkAndCreateForVector(vector: V3): void {
        if (this.array[vector.X] === undefined) {
            this.array[vector.X] = [];
            this.array[vector.X][vector.Y] = [];
        } else if (this.array[vector.X][vector.Y] === undefined) {
            this.array[vector.X][vector.Y] = [];
        }
    }
}
