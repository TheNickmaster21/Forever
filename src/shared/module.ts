import { FunctionDefinition } from '@rbxts/crochet';
import { t } from '@rbxts/t';

export const ReplicationFunction = new FunctionDefinition<(x: number, z: number) => number>(
    'ReplicationFunction',
    [t.number, t.number],
    t.number
);

export const GlobalSettings = {
    worldHeight: 15,

    gridWidth: 4,
    gridHeight: 8,

    minShownSize: 40,
    idealShownSize: 60,

    garbageTriggerPartCount: 5000,
    garbageCollectionIncrement: 10
};
