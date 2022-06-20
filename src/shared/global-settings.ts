const easyScale = 1;

export const GlobalSettings = {
    worldHeight: 15,
    worldHeightIncrement: 4,

    gridWidth: 4,
    gridHeight: 8,

    chunkWidth: 8,

    minShownSize: 3 * easyScale,
    idealShownSize: 4 * easyScale,

    garbageTriggerPartCount: math.pow(8 * 3 * easyScale, 2) * math.pi,
    garbageCollectionIncrement: 10 * easyScale
};
