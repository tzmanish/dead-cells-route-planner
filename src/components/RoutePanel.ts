import type { BiomeService } from "../services/BiomeService";
import { biomeLevelService } from "../services/BiomeLevelService";
import { BiomeLevel } from "../models/BiomeLevel";

let routePanelElement: HTMLElement | null = null;
const biomeDomElements = new Map<string, HTMLElement>();
let biomeService: BiomeService;

export function resetRoutePanel() {
    return;
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
    biomeDom.innerHTML = biome;
    return biomeDom;
}

function createLevelDom(level: BiomeLevel): HTMLElement {
    const levelDom = document.createElement('div');
    levelDom.className = `
        border-dashed border-dc-separator 
        p-4 relative
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
        const biomeDom = createBiomeDom(b);
        levelDom.appendChild(biomeDom);
    });
    return levelDom;
}

export function RoutePanel(_biomeService: BiomeService): HTMLElement {
    const panel = document.createElement('div');
    routePanelElement = panel;
    routePanelElement.className = 'px-8'
    
    biomeService = _biomeService;
    biomeService.getAllBiomes().forEach(b => biomeDomElements.set(b, createBiomeDom(b)));
    biomeLevelService.getAll().forEach(l => {
        const levelDom = createLevelDom(l);
        routePanelElement?.appendChild(levelDom);
    });
    return panel;
}