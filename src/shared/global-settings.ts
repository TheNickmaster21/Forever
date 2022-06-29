const easyScale = 1;

export const GlobalSettings = {
    voxelSize: 4,
    gridHeight: 8,

    chunkSize: 8,

    minShownSize: 3 * easyScale,
    idealShownSize: 4 * easyScale,

    garbageTriggerChunkCount: math.pow(8 * easyScale, 3),
    garbageCollectionIncrement: 10 * easyScale
};
