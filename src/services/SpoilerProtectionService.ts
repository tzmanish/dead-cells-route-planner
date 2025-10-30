import type { Biome } from "../models/Biome";

class SpoilerProtectionService {
    private spoilerProtectionEnabled: boolean;

    constructor() {
        this.spoilerProtectionEnabled = true;
    }

    public isEnabled(): boolean {
        return this.spoilerProtectionEnabled;
    }

    public isDisabled(): boolean {
        return !this.spoilerProtectionEnabled;
    }
    public enable() {
        this.spoilerProtectionEnabled = true;
    }

    public disable() {
        this.spoilerProtectionEnabled = false;
    }

    public mask(biome: Biome) : Biome {
        if(this.isDisabled() || !biome.is_spoiler) return biome;
        const biome_masked = JSON.parse(JSON.stringify(biome));
        biome_masked.name = biome_masked.name.replace(/./g, '*');
        return biome_masked;
    }
}

export const spoilerProtectionService = new SpoilerProtectionService();