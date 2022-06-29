const easyScale = 1;

export const GlobalSettings = {
    voxelSize: 4,
    gridHeight: 8,

    chunkSize: 8,

    shownRadius: 3 * easyScale,

    garbageTriggerChunkCount: math.pow(12 * easyScale, 3),
    garbageCollectionIncrement: 10 * easyScale
};
