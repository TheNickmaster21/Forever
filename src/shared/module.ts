import { EventDefinition } from '@rbxts/crochet';
import { t } from '@rbxts/t';

export const ReplicationEvent = new EventDefinition<[x: number, z: number, value?: number]>('ReplicationEvent', [
    t.number,
    t.number,
    t.optional(t.number)
]);

const easyScale = 1;

export const GlobalSettings = {
    worldHeight: 15,
    worldHeightIncrement: 4,

    gridWidth: 4,
    gridHeight: 8,

    minShownSize: 40 * easyScale,
    idealShownSize: 50 * easyScale,

    garbageTriggerPartCount: math.pow(50 * easyScale, 2) * math.pi,
    garbageCollectionIncrement: 10 * easyScale
};
