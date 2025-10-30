import type { Biome, BiomeData } from '../models/Biome.js';

class BiomeService {
    private biomeData: BiomeData;

    init(): Promise<BiomeData> {
        if(this.biomeData) return Promise.resolve(this.biomeData);
        return fetch('/biomes.json')
            .then(response => response.json())
            .then (json => {
                this.biomeData = json;
                return this.biomeData;
            })
            .catch (error => {
                console.error('Failed to load biome data:', error);
                throw error;
            });
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

export const biomeService = new BiomeService();