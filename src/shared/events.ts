import { EventDefinition } from '@rbxts/crochet';
import { t } from '@rbxts/t';
import { BlockType, isBlockType } from './block';
import { RawChunk } from './chunk';

export const FullChunkReplicationEvent = new EventDefinition<[chunkPos: Vector3, value: RawChunk | undefined]>(
    'FullChunkReplicationEvent',
    [t.Vector3, t.optional(t.table) as t.check<RawChunk | undefined>]
);

export const BlockChangeReplicationEvent = new EventDefinition<
    [chunkPos: Vector3, voxelPos: Vector3, value: BlockType]
>('BlockChangeReplicationEvent', [t.Vector3, t.Vector3, isBlockType]);

export const BlockChangeRequestReplicationEvent = new EventDefinition<
    [chunkPos: Vector3, voxelPos: Vector3, value: BlockType]
>('BlockChangeRequestReplicationEvent', [t.Vector3, t.Vector3, isBlockType]);
