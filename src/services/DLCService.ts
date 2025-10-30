import { DLC, dlcs } from '../models/Dlc.js';

class DLCService {
    private enabledDlcs: Set<DLC>;

    constructor() {
        this.enabledDlcs = new Set(this.getAll());
    }

    enable(dlc: DLC) {
        this.enabledDlcs.add(dlc);
    }

    disable(dlc: DLC) {
        this.enabledDlcs.delete(dlc);
    }

    getAll(): DLC[] {
        return Object.values(DLC);
    }

    getEnabled(): DLC[] {
        return [...this.enabledDlcs];
    }

    getName(dlcCode: DLC): string | undefined {
        return dlcs.find(d => d.code === dlcCode)?.name;
    }

    isEnabled(dlc: DLC): boolean {
        if (dlc === null) return true;
        return this.enabledDlcs.has(dlc);
    }

    filterByEnabledDLCs<T extends { dlc: DLC }>(items: T[]): T[] {
        return items.filter(item => this.isEnabled(item.dlc));
    }
}

export const dlcService = new DLCService();