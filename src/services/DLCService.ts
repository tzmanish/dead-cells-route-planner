import { DLC, dlcs } from '../models/Dlc.js';

class DLCService {
    private enabledDlcs: Set<DLC>;
    private domMap: Map<DLC, HTMLElement>;

    constructor() {
        this.enabledDlcs = new Set(this.getAll());
        this.domMap = new Map();
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

    getShortName(dlc: DLC): string {
        return dlcs.find(d => d.code === dlc)!.code;
    }

    getName(dlc: DLC): string {
        return dlcs.find(d => d.code === dlc)!.name;
    }

    getColor(dlc: DLC): string {
        return dlcs.find(d => d.code === dlc)!.color;
    }

    getDom(dlc: DLC): HTMLElement {
        if(!this.domMap.has(dlc)) {
            const span = document.createElement('span');
            span.className = 'font-bold';
            span.style.color = this.getColor(dlc);
            span.textContent = this.getShortName(dlc);
            span.title = `${this.getName(dlc)} DLC`;
            this.domMap.set(dlc, span);
        }
        return this.domMap.get(dlc)!;
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