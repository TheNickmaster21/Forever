import { EventDefinition } from '@rbxts/crochet';
import { t } from '@rbxts/t';

export const ReplicationEvent = new EventDefinition<[x: number, z: number, value?: number[][]]>('ReplicationEvent', [
    t.number,
    t.number,
    t.optional(t.array(t.array(t.number)))
]);
