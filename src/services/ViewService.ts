import { ViewStrategy } from "../models/View.js";
import { localStorageService } from "./LocalStorageService.js";

class ViewService {
    private viewStrategy!: ViewStrategy;

    constructor() {
        this.loadFromStorage();
    }

    private loadFromStorage() {
        const stored = localStorageService.loadViewStrategy();
        if (stored !== null) {
            this.viewStrategy = stored;
        } else {
            // Default
            this.viewStrategy = ViewStrategy.Static;
        }
    }

    private saveToStorage() {
        localStorageService.saveViewStrategy(this.viewStrategy);
    }

    public getStrategy(): ViewStrategy {
        return this.viewStrategy;
    }

    public setStrategy(viewStrategy: ViewStrategy) {
        this.viewStrategy = viewStrategy;
        this.saveToStorage();
    }
}

export const viewService = new ViewService();