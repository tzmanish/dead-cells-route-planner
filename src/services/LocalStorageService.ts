import type { ViewStrategy } from "../models/View";

class LocalStorageService {
    private readonly STORAGE_KEYS = {
        ENABLED_DLCS: 'dead-cells-enabled-dlcs',
        DIFFICULTY: 'dead-cells-difficulty',
        SPOILER_PROTECTION: 'dead-cells-spoiler-protection',
        VIEW_STRATEGY: 'dead-cells-planner-view'
    };

    // DLC methods
    saveEnabledDLCs(dlcs: string[]): void {
        try {
            localStorage.setItem(this.STORAGE_KEYS.ENABLED_DLCS, JSON.stringify(dlcs));
        } catch (error) {
            console.error('Failed to save enabled DLCs to localStorage:', error);
        }
    }

    loadEnabledDLCs(): string[] | null {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEYS.ENABLED_DLCS);
            return stored ? JSON.parse(stored) : null;
        } catch (error) {
            console.error('Failed to load enabled DLCs from localStorage:', error);
            return null;
        }
    }

    // Difficulty methods
    saveDifficulty(difficulty: string): void {
        try {
            localStorage.setItem(this.STORAGE_KEYS.DIFFICULTY, difficulty);
        } catch (error) {
            console.error('Failed to save difficulty to localStorage:', error);
        }
    }

    loadDifficulty(): string | null {
        try {
            return localStorage.getItem(this.STORAGE_KEYS.DIFFICULTY);
        } catch (error) {
            console.error('Failed to load difficulty from localStorage:', error);
            return null;
        }
    }

    // Spoiler protection methods
    saveSpoilerProtection(enabled: boolean): void {
        try {
            localStorage.setItem(this.STORAGE_KEYS.SPOILER_PROTECTION, JSON.stringify(enabled));
        } catch (error) {
            console.error('Failed to save spoiler protection to localStorage:', error);
        }
    }

    loadSpoilerProtection(): boolean | null {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEYS.SPOILER_PROTECTION);
            return stored !== null ? JSON.parse(stored) : null;
        } catch (error) {
            console.error('Failed to load spoiler protection from localStorage:', error);
            return null;
        }
    }

    saveViewStrategy(viewStrategy: ViewStrategy) {
        try {
            localStorage.setItem(this.STORAGE_KEYS.VIEW_STRATEGY, JSON.stringify(viewStrategy));
        } catch (error) {
            console.error('Failed to save view strategy to localStorage:', error);
        }
    }

    loadViewStrategy(): ViewStrategy | null {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEYS.VIEW_STRATEGY);
            return stored !== null ? JSON.parse(stored) : null;
        } catch (error) {
            console.error('Failed to load view strategy from localStorage:', error);
            return null;
        }
    }

    // Clear all stored data
    clearAll(): void {
        try {
            Object.values(this.STORAGE_KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
        } catch (error) {
            console.error('Failed to clear localStorage:', error);
        }
    }
}

export const localStorageService = new LocalStorageService();
