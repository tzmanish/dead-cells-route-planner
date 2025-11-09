import { eventEmitter } from "../services/EventEmitterService";

declare global {
    interface Window {
        LeaderLine: any;
        AnimEvent: any;
    }
}

class LeaderLine {
    svgWrapper?: HTMLElement;

    init(parent: HTMLElement) {
        this.svgWrapper = document.createElement('div');
        this.svgWrapper.className = 'w-0 h-0 absolute top-0 left-0 z-100';
        parent.appendChild(this.svgWrapper);
        this.reposition(parent);
    } 
    
    public clear() {
        this.svgWrapper?.remove();
    }

    public reposition(parent: HTMLElement) {
        if(!this.svgWrapper) return;
        const rectWrapper = parent.getBoundingClientRect();
        this.svgWrapper.style.transform = `translate(${-rectWrapper.left - window.scrollX}px, ${-rectWrapper.top - window.scrollY}px)`;
    }

    public reset(parent: HTMLElement) {
        this.clear();
        this.init(parent);
    }

    public create(src: HTMLElement, dst: HTMLElement, props: object) {
        const line = new window.LeaderLine(src, dst, props);
        const elmLine = document.querySelector('body > .leader-line:last-child');
        if (elmLine && this.svgWrapper) this.svgWrapper.appendChild(elmLine);

        src.parentElement?.addEventListener('scroll', window.AnimEvent.add(() =>  line.position()), false);
        dst.parentElement?.addEventListener('scroll', window.AnimEvent.add(() =>  line.position()), false);
        eventEmitter.on('route-panel-reset', ()=>{
            src.parentElement?.removeEventListener('scroll', window.AnimEvent.add(() =>  line.position()));
            dst.parentElement?.removeEventListener('scroll', window.AnimEvent.add(() =>  line.position()));
        });
    }
}

let initPromise: Promise<LeaderLine> | null = null;
async function initLeaderLine(): Promise<LeaderLine> {
    if (initPromise) return initPromise;
    if (window.LeaderLine && window.AnimEvent) {
        initPromise = Promise.resolve(new LeaderLine());
        return initPromise;
    }

    const loadScript = (src: string): Promise<void> => new Promise((res, rej) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => res();
        script.onerror = () => rej(new Error(`Failed to load ${src}`));
        document.head.appendChild(script);
    });

    initPromise = Promise.all([
            window.AnimEvent ? Promise.resolve() : loadScript(`${import.meta.env.BASE_URL}anim-event.min.js`),
            window.LeaderLine ? Promise.resolve() : loadScript(`${import.meta.env.BASE_URL}leader-line.min.js`)
        ])
        .then(() => new LeaderLine())
        .catch(error => {
            initPromise = null;
            throw error;
        });
    return initPromise;
}

export const leaderLine = await initLeaderLine();