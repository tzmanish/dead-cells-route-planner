import type { Biome, BiomeData } from '../models/Biome.js';

class BiomeService {
    private biomeData: BiomeData;

    constructor(data: BiomeData) {
        this.biomeData = data;
    }

    getAllBiomes(): Biome[] {
        return this.biomeData.biomes;
    }

    getBiomeByName(name: string): Biome | undefined {
        return this.biomeData.biomes.find(b => b.name === name);
    }

    getBiomesByLevel(level: number): Biome[] {
        return this.biomeData.biomes.filter(b => b.level === level);
    }

    getBiomesByDLC(dlc: string | null): Biome[] {
        return this.biomeData.biomes.filter(b => b.dlc === dlc);
    }

    getWikiURL(biome: Biome): string {
        return `${this.biomeData.wiki_base}${biome.wiki}`;
    }

    getImageURL(biome: Biome): string {
        return `${this.biomeData.wiki_base}${biome.image}`;
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

export const biomeService = initBiomeService();