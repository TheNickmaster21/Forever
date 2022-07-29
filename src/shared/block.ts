import { AttributeDefinition } from '@rbxts/crochet';
import { TypeCheck } from '@rbxts/crochet/out/core';

export const Air: BlockType = 0;
export const Grass: BlockType = 1;
export const Dirt: BlockType = 2;
export const LightStone: BlockType = 3;
export const DarkStone: BlockType = 4;

export type BlockType = 0 | 1 | 2 | 3 | 4;
export const BlockTypes: BlockType[] = [0, 1, 2, 3, 4];

function isBlockType(v: unknown): v is BlockType {
    return BlockTypes.includes(v as BlockType);
}

export const BlockTypeAttribute = new AttributeDefinition<BlockType>('BlockType', isBlockType);

export interface BlockConfig {
    name: string;
    color: Color3;
}

export const BlockConfig: Record<BlockType, BlockConfig> = {
    [Air]: {
        name: 'Air',
        color: new Color3(1, 1, 1)
    },
    [Grass]: {
        name: 'Grass',
        color: Color3.fromRGB(13, 77, 13)
    },
    [Dirt]: {
        name: 'Dirt',
        color: Color3.fromRGB(84, 56, 36)
    },
    [LightStone]: {
        name: 'Light Stone',
        color: Color3.fromRGB(125, 125, 125)
    },
    [DarkStone]: {
        name: 'Dark Stone',
        color: Color3.fromRGB(48, 48, 48)
    }
};
