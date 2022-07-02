import { EventDefinition } from '@rbxts/crochet';
import { t } from '@rbxts/t';

export const ReplicationEvent = new EventDefinition<[chunkPos: Vector3, value?: boolean[][][]]>('ReplicationEvent', [
    t.Vector3,
    t.optional(t.array(t.array(t.array(t.boolean))))
]);
