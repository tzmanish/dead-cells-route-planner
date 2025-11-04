import { Difficulty } from "../models/Difficulty";
import { localStorageService } from "./LocalStorageService.js";

class DifficultyService {
    private currentDifficulty!: Difficulty;

    constructor() {
        this.loadFromStorage();
    }

    private loadFromStorage() {
        const stored = localStorageService.loadDifficulty();
        if (stored !== null) {
            const parsedValue = parseInt(stored, 10);
            const validDifficulties = Object.values(Difficulty) as number[];
            if (!isNaN(parsedValue) && validDifficulties.includes(parsedValue)) {
                this.currentDifficulty = parsedValue as Difficulty;
            } else {
                this.currentDifficulty = Difficulty.BC0;
            }
        } else {
            // Default difficulty
            this.currentDifficulty = Difficulty.BC0;
        }
    }

    private saveToStorage() {
        localStorageService.saveDifficulty(this.currentDifficulty.toString());
    }

    set(difficulty: Difficulty): void {
        this.currentDifficulty = difficulty;
        this.saveToStorage();
    }

    getCurrent(): Difficulty {
        return this.currentDifficulty;
    }

    getAll(): Difficulty[] {
        return Object.values(Difficulty);
    }

    getName(difficulty: Difficulty): string {
        return `${difficulty} BC`;
    }
}

export const difficultyService = new DifficultyService();