import { BiomeLevel, biomeLevelNameMap } from "../models/BiomeLevel";

class BiomeLevelService {
    private currentLevel: BiomeLevel;

    constructor() {
        this.currentLevel = BiomeLevel.L1;
    }

    set(level: BiomeLevel): void {
        this.currentLevel = level;
    }

    getCurrent(): BiomeLevel {
        return this.currentLevel;
    }

    getAll(): BiomeLevel[] {
        return Object.values(BiomeLevel);
    }

    getName(level: BiomeLevel): string {
        return biomeLevelNameMap[level];
    }
}

export const biomeLevelService = new BiomeLevelService();