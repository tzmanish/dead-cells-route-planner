import type { ScrollCount } from "../models/Biome";
import { biomeLevelService } from "./BiomeLevelService";
import type { BiomeService } from "./BiomeService";
import { difficultyService } from "./DifficultyService";
import { dlcService } from "./DLCService";

export class RouteService {
    private biomeService: BiomeService;
    private nextLevelMap: Map<string, string>;
    private commulativeScrollCountMap: Map<string, ScrollCount>;

    constructor(biomeService: BiomeService) {
        this.biomeService = biomeService;
        this.nextLevelMap = new Map();
        this.commulativeScrollCountMap = new Map();
        this.recalculate();
    }

    getNextBiome(biome: string): string | undefined {
        return this.nextLevelMap.get(biome);
    }

    scrollCount(biome: string): ScrollCount | undefined {
        return this.commulativeScrollCountMap.get(biome);
    }

    flattenCount(scrolls: ScrollCount): number {
        return scrolls.power + scrolls.cursed + scrolls.dual + (scrolls.fragment / 4);
    }

    flatCommulativeScrollCount(biome: string): number {
        const scrolls = this.scrollCount(biome);
        if(!scrolls) return 0;
        return this.flattenCount(scrolls);
    }

    flatCommulativeScrollCount_weighted(biome: string): number {
        const scrolls = this.scrollCount(biome);
        if(!scrolls) return 0;
        return this.flattenCount(scrolls);
    }

    recalculate() {
        this.nextLevelMap.clear();
        this.commulativeScrollCountMap.clear();
        const levels = biomeLevelService.getAll();
        const difficulty = difficultyService.getCurrent();
        for(let i=levels.length-1; i>=0; i--) {
            const biomes = this.biomeService.getBiomesByLevel(levels[i]).map(b => this.biomeService.getBiomeObject(b)).filter(b => b !== undefined);
            dlcService.filterByEnabledDLCs(biomes).forEach(biome => {
                if(biome) {
                    const exits_all = biome.exits[difficulty].map(e=>this.biomeService.getBiomeObject(e)).filter(e=>e!==undefined);
                    const exits = dlcService.filterByEnabledDLCs(exits_all);
                    let prefferedExit = null;
                    if(exits.length > 0) {
                        prefferedExit = exits.reduce((prev, cur)=>{
                            if(!cur) return prev;
                            if(!prev) return cur;
                            if(this.flatCommulativeScrollCount_weighted(cur.name) > this.flatCommulativeScrollCount_weighted(prev.name)) return cur;
                            return prev;
                        });
                    }
                    let scrollCount = biome.scrolls[difficulty];
                    const prevScrollCount = prefferedExit? this.commulativeScrollCountMap.get(prefferedExit.name): null;
                    if(prevScrollCount) scrollCount = {
                        power : scrollCount.power + prevScrollCount.power,
                        dual : scrollCount.dual + prevScrollCount.dual,
                        fragment : scrollCount.fragment + prevScrollCount.fragment,
                        cursed : +(scrollCount.cursed + prevScrollCount.cursed).toFixed(2)
                    }
                    if(prefferedExit) this.nextLevelMap.set(biome.name, prefferedExit.name);
                    this.commulativeScrollCountMap.set(biome.name, scrollCount);
                }
            });
        }
    }
}
