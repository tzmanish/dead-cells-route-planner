import { DynamicView } from "../components/viewRenderers/DynamicView.js";
import { errorView } from "../components/viewRenderers/ErrorView.js";
import { StaticView } from "../components/viewRenderers/StaticView.js";
import { ViewStrategy, type ViewRenderer } from "../models/View.js";
import { eventEmitter } from "./EventEmitterService.js";
import { localStorageService } from "./LocalStorageService.js";

class ViewService {
    private viewStrategy!: ViewStrategy;
    private viewStrategyCreatorMapping = new Map<ViewStrategy, new () => ViewRenderer>([
        [ViewStrategy.Static, StaticView],
        [ViewStrategy.Dynamic, DynamicView]
    ]);
    private viewStrategyRenderer: Map<ViewStrategy, ViewRenderer> = new Map();

    constructor() {
        this.loadFromStorage();
    }

    private getRenderer(): ViewRenderer {
        if(!this.viewStrategyRenderer.has(this.viewStrategy)) {
            const ctor = this.viewStrategyCreatorMapping.get(this.viewStrategy);
            if(ctor) this.viewStrategyRenderer.set(this.viewStrategy, new ctor());
            else return errorView;
        }
        return this.viewStrategyRenderer.get(this.viewStrategy) || errorView;
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
        this.getRenderer().clear();
        this.viewStrategy = viewStrategy;
        this.saveToStorage();
        eventEmitter.emit('view-update');
    }

    public getView(): HTMLElement {
        return this.getRenderer().render();
    }
}

export const viewService = new ViewService();