export class Simple3DArray<V> {
    private array: V[][][];

    constructor(initialArray?: V[][][]) {
        this.array = initialArray ?? [];
    }

    public set(keyX: number, keyY: number, keyZ: number, value: V): void {
        this.checkAndCreateKeyXAndKeyY(keyX, keyY);
        this.array[keyX][keyY][keyZ] = value;
    }

    public delete(keyX: number, keyY: number, keyZ: number): void {
        this.checkAndCreateKeyXAndKeyY(keyX, keyY);
        delete this.array[keyX][keyY][keyZ];
    }

    public clear(): void {
        this.array = [];
    }

    public get(keyX: number, keyY: number, keyZ: number): V | undefined {
        this.checkAndCreateKeyXAndKeyY(keyX, keyY);
        return this.array[keyX][keyY][keyZ];
    }

    public has(keyX: number, keyY: number, keyZ: number): boolean {
        this.checkAndCreateKeyXAndKeyY(keyX, keyY);
        return this.array[keyX][keyY][keyZ] !== undefined;
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
}
