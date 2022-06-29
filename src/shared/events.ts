import { EventDefinition } from '@rbxts/crochet';
import { t } from '@rbxts/t';

export const ReplicationEvent = new EventDefinition<[x: number, y: number, z: number, value?: boolean[][][]]>(
    'ReplicationEvent',
    [t.number, t.number, t.number, t.optional(t.array(t.array(t.array(t.boolean))))]
);
