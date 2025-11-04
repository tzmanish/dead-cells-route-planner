import type { Biome } from "../models/Biome";
import { localStorageService } from "./LocalStorageService.js";

class SpoilerProtectionService {
    private spoilerProtectionEnabled!: boolean;

    constructor() {
        this.loadFromStorage();
    }

    private loadFromStorage() {
        const stored = localStorageService.loadSpoilerProtection();
        if (stored !== null) {
            this.spoilerProtectionEnabled = stored;
        } else {
            // Default: enabled
            this.spoilerProtectionEnabled = true;
        }
    }

    private saveToStorage() {
        localStorageService.saveSpoilerProtection(this.spoilerProtectionEnabled);
    }

    public isEnabled(): boolean {
        return this.spoilerProtectionEnabled;
    }

    public isDisabled(): boolean {
        return !this.spoilerProtectionEnabled;
    }

    public enable() {
        this.spoilerProtectionEnabled = true;
        this.saveToStorage();
    }

    public disable() {
        this.spoilerProtectionEnabled = false;
        this.saveToStorage();
    }

    public mask(biome: Biome) : Biome {
        if(this.isDisabled() || !biome.is_spoiler) return biome;
        const biome_masked = JSON.parse(JSON.stringify(biome));
        biome_masked.name = biome_masked.name.replace(/./g, '*');
        return biome_masked;
    }
}

export const spoilerProtectionService = new SpoilerProtectionService();