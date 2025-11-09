import type { Biome } from '../models/Biome.js';
import { BiomeLevel } from '../models/BiomeLevel.js';
import type { DLC } from '../models/Dlc.js';
import { biomeLevelService } from './BiomeLevelService.js';

export class BiomeService {
    private biomeMap: Map<string, Biome>;
    private levelMap: Map<BiomeLevel, Set<string>>;

    constructor(biomes: Biome[]) {
        this.biomeMap = new Map();
        this.levelMap = new Map();
        biomeLevelService.getAll().forEach(l => this.levelMap.set(l, new Set<string>()));
        biomes.forEach(b=>{
            this.biomeMap.set(b.name, b);
            this.levelMap.get(b.level)?.add(b.name);
        });
    }

    getAllBiomes(): string[] {
        return [...this.biomeMap.values()].map(b=>b.name);
    }

    getBiomeObject(name: string): Biome | undefined {
        return this.biomeMap.get(name);
    }

    getBiomesByLevel(level: BiomeLevel): string[] {
        const biomes =  this.levelMap.get(level)||new Set();
        return [...biomes];
    }

    getBiomesByDLC(dlc: DLC): string[] {
        return [...this.biomeMap.values()].filter(b => b.dlc === dlc).map(b=>b.name);
    }

    getWikiURL(biome: string): string {
        return this.getBiomeObject(biome)?.wiki||'';
    }

    getImageURL(biome: string): string {
        const link = this.getBiomeObject(biome)?.image;
        return link? link: `${import.meta.env.BASE_URL}biome_placeholder.svg`;
    }
}

let initPromise: Promise<BiomeService> | null = null;
async function initBiomeService(): Promise<BiomeService> {
    if(initPromise) return initPromise;
    initPromise = fetch(import.meta.env.BASE_URL + 'biomes.json')
        .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.json()
        })
        .then(biomes => new BiomeService(biomes))
        .catch (error => {
            initPromise = null;
            console.error('Failed to load biome data:', error);
            throw error;
        });
    return initPromise;
}

export const biomeService = await initBiomeService();