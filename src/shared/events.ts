import { EventDefinition } from '@rbxts/crochet';
import { t } from '@rbxts/t';
import { BlockType, isBlockType } from './block';
import { ChunkPosition, LocalChunkOffset, RawChunk } from './chunk';

export const FullChunkReplicationEvent = new EventDefinition<[chunkPos: ChunkPosition, value: RawChunk | undefined]>(
    'FullChunkReplicationEvent',
    [t.Vector3 as t.check<ChunkPosition>, t.optional(t.table) as t.check<RawChunk | undefined>]
);

export const BlockChangeReplicationEvent = new EventDefinition<
    [chunkPos: ChunkPosition, voxelPos: LocalChunkOffset, value: BlockType]
>('BlockChangeReplicationEvent', [
    t.Vector3 as t.check<ChunkPosition>,
    t.Vector3 as t.check<LocalChunkOffset>,
    isBlockType
]);

export const BlockChangeRequestReplicationEvent = new EventDefinition<
    [chunkPos: ChunkPosition, voxelPos: LocalChunkOffset, value: BlockType]
>('BlockChangeRequestReplicationEvent', [
    t.Vector3 as t.check<ChunkPosition>,
    t.Vector3 as t.check<LocalChunkOffset>,
    isBlockType
]);
