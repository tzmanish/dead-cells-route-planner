export enum ViewStrategy {
    Static,
    Dynamic
}

export interface ViewRenderer {
    render(): HTMLElement
    refresh(): void
    clear(): void
}