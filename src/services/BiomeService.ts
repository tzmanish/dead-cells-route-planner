import type { Biome, BiomeData } from '../models/Biome.js';
import { BiomeLevel } from '../models/BiomeLevel.js';
import type { DLC } from '../models/Dlc.js';
import { biomeLevelService } from './BiomeLevelService.js';

export class BiomeService {
    private wiki_base: string;
    private biomeMap: Map<string, Biome>;
    private levelMap: Map<BiomeLevel, Set<string>>;

    constructor(data: BiomeData) {
        this.wiki_base = data.wiki_base;
        this.biomeMap = new Map();
        this.levelMap = new Map();
        biomeLevelService.getAll().forEach(l => this.levelMap.set(l, new Set<string>()));
        data.biomes.forEach(b=>{
            this.biomeMap.set(b.name, b);
            this.levelMap.get(b.level)?.add(b.name);
        });
    }

    private getAbsoluteWikiLink(link: string): string {
        if(link.startsWith(this.wiki_base)) return link;
        return `${this.wiki_base}${link}`;
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
        return this.getAbsoluteWikiLink(this.getBiomeObject(biome)?.wiki||'');
    }

    getImageURL(biome: string): string {
        const link = this.getBiomeObject(biome)?.image;
        return link? this.getAbsoluteWikiLink(link): `biome_placeholder.svg`;
    }
}

async function initBiomeService(): Promise<BiomeService> {
    try {
        const response = await fetch('/biomes.json');
        const data: BiomeData = await response.json();
        return new BiomeService(data);
    } catch (error) {
        console.error('Failed to load biome data:', error);
        throw error;
    }
}

export const biomeServiceReference = initBiomeService();