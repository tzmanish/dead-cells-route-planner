import type { ViewRenderer } from "../../models/View";

class ErrorView implements ViewRenderer {
    public render(): HTMLElement {
        const currentView = document.createElement('span');
        currentView.textContent = 'Error!!'
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

export const errorView = new ErrorView();