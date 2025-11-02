import type { BiomeService } from "../services/BiomeService";
import { biomeLevelService } from "../services/BiomeLevelService";
import { BiomeLevel } from "../models/BiomeLevel";
import { RouteService } from "../services/RouteService";
import { difficultyService } from "../services/DifficultyService";

// Leader-line attaches itself to window when loaded as a script
declare global {
    interface Window {
        LeaderLine: any;
    }
}

// Load leader-line via script tag
function loadLeaderLine(): Promise<void> {
    return new Promise((resolve, reject) => {
        if (window.LeaderLine) {
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = '/node_modules/leader-line/leader-line.min.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load LeaderLine'));
        document.head.appendChild(script);
    });
}

let routePanelElement: HTMLElement | null = null;
const biomeDomElements = new Map<string, HTMLElement>();
let biomeService: BiomeService;
let routeService: RouteService;
let connectors:any[] = [];

export function resetRoutePanel() {
    routeService.recalculate();

    loadLeaderLine().then(() => {
        connectors.forEach(line=>line.remove());
        connectors = [];

        let current = biomeService.getBiomesByLevel(BiomeLevel.L1)[0];
        let e_current = biomeDomElements.get(current);
        let next = routeService.getNextBiome(current);
        let e_next = biomeDomElements.get(next||"");

        while(next) {
            const line = new window.LeaderLine(
                e_current, 
                e_next,
                {startSocket: 'bottom', endSocket: 'top', color: '#f9cf87', size: 1.2}
            );
            connectors.push(line);
            e_current = e_next;
            next = routeService.getNextBiome(next);
            e_next = biomeDomElements.get(next||"");
        }
    }).catch(err => {
        console.error('Failed to load or use LeaderLine:', err);
    });

    biomeDomElements.forEach((biomeDom, biome) => {
        const biomeObj = biomeService.getBiomeObject(biome);
        const difficulty = difficultyService.getCurrent();

        const title = document.createElement('span');
        title.className = 'px-2';
        title.textContent = biome;
        biomeDom.appendChild(title);
        
        const scrolls = biomeObj?.scrolls[difficulty];
        const scrollCount = document.createElement('span');
        scrollCount.className = 'px-2';
        scrollCount.textContent = scrolls? `${routeService.flattenCount(scrolls)} (${scrolls.power} Power + ${scrolls.cursed} Cursed + ${scrolls.dual} Dual + ${scrolls.fragment} Fragments)`: 'no scrolls data';
        biomeDom.appendChild(scrollCount);
        
        const commulativeScrollCount = document.createElement('span');
        const commulativeScrolls = routeService.scrollCount(biome);
        commulativeScrollCount.className = 'px-2';
        commulativeScrollCount.textContent = commulativeScrolls? `${routeService.flattenCount(commulativeScrolls)} (${commulativeScrolls.power} Power + ${commulativeScrolls.cursed} Cursed + ${commulativeScrolls.dual} Dual + ${commulativeScrolls.fragment} Fragments)`: 'no scrolls data';
        biomeDom.appendChild(commulativeScrollCount);
        
        const next = document.createElement('span');
        next.className = 'px-2';
        next.textContent = routeService.getNextBiome(biome)||'no way ahead';
        biomeDom.appendChild(next);
    });
}

function darkenedBackground(link: string):string {
    return `linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.8)), url(${link})`;
}

function createBiomeDom(biome: string): HTMLElement {
    const height = 100; //px
    const placeholderAspect = 598 / 168;
    const width = height * placeholderAspect;

    const biomeDom = document.createElement('button');
    const placeholderUrl = '/biome_placeholder.svg';
    const actualUrl = biomeService.getImageURL(biome);
    biomeDom.className = `
        p-2 inline-block bg-center bg-no-repeat z-10
        cursor-pointer active:outline-2 
        bg-[length:100%_100%] hover:bg-[length:110%_110%] transition-[background-size] duration-400 ease-out
    `;
    biomeDom.style.height = `${height}px`;
    biomeDom.style.width = `${width}px`;
    biomeDom.style.backgroundImage = `url(${placeholderUrl})`;

    const img = new Image();
    img.src = actualUrl;
    img.onload = () => biomeDom.style.backgroundImage = darkenedBackground(actualUrl);

    return biomeDom;
}

function createLevelDom(level: BiomeLevel): HTMLElement {
    const levelDom = document.createElement('div');
    levelDom.className = `
        border-dashed border-dc-separator 
        py-8 relative
        flex flex-wrap justify-center gap-4`; 
    if(level != BiomeLevel.L1) levelDom.classList.add('border-t-1');

    const levelName = document.createElement('span');
    levelName.innerHTML = biomeLevelService.getName(level);
    levelName.className = `
        absolute left-0 bottom-0
        text-sm font-bold text-dc-separator text-center
        -rotate-90 origin-bottom-left hiddener
    `;

    new ResizeObserver(() => {
        const parentHeight = levelDom.offsetHeight;
        levelName.style.width = `${parentHeight}px`;
        levelName.classList.remove('hidden');
    }).observe(levelDom);
        
    levelDom.appendChild(levelName);

    biomeService.getBiomesByLevel(level).forEach(b => {
        const biomeDom = biomeDomElements.get(b);
        if (biomeDom) {
            levelDom.appendChild(biomeDom);
        }
    });
    return levelDom;
}

export function RoutePanel(_biomeService: BiomeService): HTMLElement {
    const panel = document.createElement('div');
    routePanelElement = panel;
    routePanelElement.className = 'px-8'
    
    biomeService = _biomeService;
    routeService = new RouteService(biomeService);
    biomeService.getAllBiomes().forEach(b => biomeDomElements.set(b, createBiomeDom(b)));
    biomeLevelService.getAll().forEach(l => {
        const levelDom = createLevelDom(l);
        routePanelElement?.appendChild(levelDom);
    });

    resetRoutePanel();
    return panel;
}