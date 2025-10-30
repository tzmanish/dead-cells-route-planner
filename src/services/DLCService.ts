import { DLC, type DLCType } from '../models/dlcs.js';

class DLCService {
    getAllDLCs(): DLC[] {
        return Object.values(DLC);
    }

    isDLCEnabled(dlc: DLCType, enabledDLCs: DLC[]): boolean {
        if (dlc === null) return true; // Base game content always enabled
        return enabledDLCs.includes(dlc);
    }

    filterByEnabledDLCs<T extends { dlc: DLCType }>(items: T[], enabledDLCs: DLC[]): T[] {
        return items.filter(item => this.isDLCEnabled(item.dlc, enabledDLCs));
    }
}

// Export singleton instance
export const dlcService = new DLCService();