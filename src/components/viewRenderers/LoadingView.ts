import type { ViewRenderer } from "../../models/View";

class LoadingView implements ViewRenderer {
    public render(): HTMLElement {
        const currentView = document.createElement('span');
        currentView.textContent = 'Loading...'
        currentView.className = 'flex justify-center';
        return currentView;
    }
    public refresh(): void {
        return;
    }
    public clear(): void {
        return;
    }
}

export const loadingView = new LoadingView();