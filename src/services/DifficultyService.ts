import { Difficulty } from "../models/Difficulty";

class DifficultyService {
    private currentDifficulty: Difficulty;

    constructor() {
        this.currentDifficulty = Difficulty.BC0;
    }

    set(difficulty: Difficulty): void {
        this.currentDifficulty = difficulty;
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