export class Simple2DArray<V> {
    private array: V[][];

    constructor(initialArray?: V[][]) {
        this.array = initialArray ?? [];
    }

    public set(keyX: number, keyY: number, value: V): void {
        this.checkAndCreateKeyX(keyX);
        this.array[keyX][keyY] = value;
    }

    public delete(keyX: number, keyY: number): void {
        this.checkAndCreateKeyX(keyX);
        delete this.array[keyX][keyY];
    }

    public clear(): void {
        this.array = [];
    }

    public get(keyX: number, keyY: number): V | undefined {
        this.checkAndCreateKeyX(keyX);
        return this.array[keyX][keyY];
    }

    public has(keyX: number, keyY: number): boolean {
        this.checkAndCreateKeyX(keyX);
        return this.array[keyX][keyY] !== undefined;
    }

    public raw(): V[][] {
        return this.array;
    }

    private checkAndCreateKeyX(keyX: number): void {
        if (this.array[keyX] === undefined) {
            this.array[keyX] = [];
        }
    }
}
