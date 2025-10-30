import type { DLCType } from './dlcs.js';

// Enums for better type safety and IntelliSense
export enum BiomeType {
    Standard = "standard",
    Optional = "optional", 
    Boss = "boss"
}

export enum DoorType {
    ChainedItems = "Chained Items",
    TreasureChest = "Treasure Chest",
    CellVat = "Cell Vat",
    FestiveOutfit = "Festive Outfit",
    WeaponSkillShop = "Weapon/Skill Shop",
    FoodShop = "Food Shop"
}

// Biome levels as literal union for exact values
export type Difficulty = 0 | 1 | 2 | 3 | 4;
export type BiomeLevel = 0 | 1 | 2 | 2.5 | 3 | 3.5 | 4 | 5 | 5.5 | 6 | 6.5 | 7 | 8;

export type ScrollCount = {
    power: number;
    dual: number;
    fragment: number;
}

export type DifficultyMap<T> = {
    [K in Difficulty]: T;
};

// JSON structure from the external file
export interface BiomeData {
    wiki_base: string;
    biomes: Biome[];
}

export interface Biome {
    readonly name: string;
    readonly wiki: string;
    readonly image: string;
    readonly dlc: DLCType;
    readonly type: BiomeType;
    readonly level: BiomeLevel;
    readonly is_spoiler: boolean;
    readonly entrances: DifficultyMap<readonly string[]>;
    readonly exits: DifficultyMap<readonly string[]>;
    readonly scrolls: DifficultyMap<ScrollCount>;
    readonly elites: {
        readonly obelisk: number;
        readonly wandering: number;
    };
    readonly doors: DifficultyMap<readonly DoorType[]>;
    readonly cursed_chests: number;
    readonly timed_door: number | null;
}