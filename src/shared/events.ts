import { EventDefinition } from '@rbxts/crochet';
import { t } from '@rbxts/t';
import { RawChunk } from './chunk';

export const ReplicationEvent = new EventDefinition<[chunkPos: Vector3, value: RawChunk | undefined]>(
    'ReplicationEvent',
    [t.Vector3, t.optional(t.table) as t.check<RawChunk | undefined>]
);
