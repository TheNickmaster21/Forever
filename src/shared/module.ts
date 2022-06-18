import { EventDefinition } from '@rbxts/crochet';
import { t } from '@rbxts/t';

export const ReplicationEvent = new EventDefinition<[x: number, z: number, value?: number]>('ReplicationEvent', [
    t.number,
    t.number,
    t.optional(t.number)
]);

export const GlobalSettings = {
    worldHeight: 15,

    gridWidth: 4,
    gridHeight: 8,

    minShownSize: 40,
    idealShownSize: 60,

    garbageTriggerPartCount: 5000,
    garbageCollectionIncrement: 10
};
