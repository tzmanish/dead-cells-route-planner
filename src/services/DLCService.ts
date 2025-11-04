import { DLC, dlcs } from '../models/Dlc.js';

class DLCService {
    private enabledDlcs: Set<DLC>;

    constructor() {
        this.enabledDlcs = new Set(this.getAll());
    }

    enable(dlc: DLC) {
        if(dlc === null) return;
        this.enabledDlcs.add(dlc);
    }
    
    disable(dlc: DLC) {
        if(dlc === null) return;
        this.enabledDlcs.delete(dlc);
    }

    getAll(): DLC[] {
        return Object.values(DLC);
    }

    getEnabled(): DLC[] {
        return [...this.enabledDlcs];
    }

    getShortName(dlc: DLC): string {
        return dlc !== null? dlcs.find(d => d.code === dlc)!.code: '';
    }

    getName(dlc: DLC): string {
        return dlc !== null? dlcs.find(d => d.code === dlc)!.name: '';
    }

    getColor(dlc: DLC): string {
        return dlc !== null? dlcs.find(d => d.code === dlc)!.color: '';
    }

    getDom(dlc: DLC): HTMLElement {
        const span = document.createElement('span');
        span.className = 'font-bold';
        span.style.color = this.getColor(dlc);
        span.textContent = this.getShortName(dlc);
        span.title = `${this.getName(dlc)} DLC`;
        return span;
    }

    isEnabled(dlc: DLC): boolean {
        if (dlc === null) return true;
        return this.enabledDlcs.has(dlc);
    }

    isDisabled(dlc: DLC): boolean {
        return !this.isEnabled(dlc);
    }

    filterByEnabledDLCs<T extends { dlc: DLC }>(items: T[]): T[] {
        return items.filter(item => this.isEnabled(item.dlc));
    }
}

export const dlcService = new DLCService();