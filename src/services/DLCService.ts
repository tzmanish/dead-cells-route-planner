import { DLC, dlcs } from '../models/Dlc.js';
import { localStorageService } from './LocalStorageService.js';

class DLCService {
    private enabledDlcs!: Set<DLC>;

    constructor() {
        this.loadFromStorage();
    }

    private loadFromStorage() {
        const stored = localStorageService.loadEnabledDLCs();
        if (stored !== null) {
            this.enabledDlcs = new Set(stored as DLC[]);
        } else {
            // Default: all DLCs enabled
            this.enabledDlcs = new Set(this.getAll());
        }
    }

    private saveToStorage() {
        const dlcArray = [...this.enabledDlcs].filter(dlc => dlc !== null) as string[];
        localStorageService.saveEnabledDLCs(dlcArray);
    }

    enable(dlc: DLC) {
        if(dlc === null) return;
        this.enabledDlcs.add(dlc);
        this.saveToStorage();
    }
    
    disable(dlc: DLC) {
        if(dlc === null) return;
        this.enabledDlcs.delete(dlc);
        this.saveToStorage();
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