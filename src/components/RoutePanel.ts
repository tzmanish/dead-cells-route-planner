import type { BiomeService } from "../services/BiomeService";
import { biomeLevelService } from "../services/BiomeLevelService";
import { BiomeLevel } from "../models/BiomeLevel";
import { RouteService } from "../services/RouteService";
import { difficultyService } from "../services/DifficultyService";
import { eventEmitter } from "../services/EventEmitterService";
import { dlcService } from "../services/DLCService";
import { BiomeType } from "../models/Biome";
import { spoilerProtectionService } from "../services/SpoilerProtectionService";

declare global {
    interface Window {
        LeaderLine: any;
        AnimEvent: any;
    }
}

function loadLeaderLine(): Promise<void> {
    return new Promise((resolve, reject) => {
        if (window.LeaderLine && window.AnimEvent) {
            resolve();
            return;
        }
        
        const loadScript = (src: string): Promise<void> => {
            return new Promise((res, rej) => {
                const script = document.createElement('script');
                script.src = src;
                script.onload = () => res();
                script.onerror = () => rej(new Error(`Failed to load ${src}`));
                document.head.appendChild(script);
            });
        };

        Promise.all([
            window.AnimEvent ? Promise.resolve() : loadScript('/node_modules/anim-event/anim-event.min.js'),
            window.LeaderLine ? Promise.resolve() : loadScript('/node_modules/leader-line/leader-line.min.js')
        ])
        .then(() => resolve())
        .catch(reject);
    });
}

function clearLeaderLines() {
    svgWrapper?.remove();
}

function repositionLeaderLines(parent: HTMLElement) {
    const rectWrapper = parent.getBoundingClientRect();
    if(svgWrapper) svgWrapper.style.transform = `translate(${-rectWrapper.left - window.pageXOffset}px, ${-rectWrapper.top - window.pageYOffset}px)`;
}

function initLeaderLine(parent: HTMLElement) {
    clearLeaderLines();
    svgWrapper = document.createElement('div');
    svgWrapper.className = 'w-0 h-0 absolute top-0 left-0'
    parent.appendChild(svgWrapper);
    repositionLeaderLines(parent);
}

function darkenedBackground(link: string):string {
    return `linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.8)), url(${link})`;
}

let routePanelElement: HTMLElement | null = null;
let svgWrapper: HTMLElement | null = null;
const biomeDomElements = new Map<string, HTMLElement>();
let biomeService: BiomeService;
let routeService: RouteService;

export function resetRoutePanel() {
    routeService.recalculate();

    loadLeaderLine().then(() => {
        if(routePanelElement) initLeaderLine(routePanelElement);
        
        const entryBiome = biomeService.getBiomesByLevel(BiomeLevel.L1)[0];
        let current = entryBiome;
        let e_current = biomeDomElements.get(current);
        let next = routeService.getNextBiome(current);
        let e_next = biomeDomElements.get(next||"");

        while(next) {
            const line = new window.LeaderLine(
                e_current, 
                e_next,
                {startSocket: 'bottom', endSocket: 'top', color: '#f9cf87', size: 1.2, path: 'grid'}
            );

            const elmLine = document.querySelector('body > .leader-line:last-child');
            if (elmLine && svgWrapper) {
                svgWrapper.appendChild(elmLine);
            }

            e_current?.parentElement?.addEventListener('scroll', window.AnimEvent.add(() =>  line.position()), false);
            e_next?.parentElement?.addEventListener('scroll', window.AnimEvent.add(() =>  line.position()), false);
            eventEmitter.on('route-panel-reset', ()=>{
                e_current?.parentElement?.removeEventListener('scroll', window.AnimEvent.add(() =>  line.position()));
                e_next?.parentElement?.removeEventListener('scroll', window.AnimEvent.add(() =>  line.position()));
            });

            e_next?.scrollIntoView();

            e_current = e_next;
            next = routeService.getNextBiome(next);
            e_next = biomeDomElements.get(next||"");
        }
        window.scrollTo(0, 0);
    }).catch(err => {
        console.error('Failed to load or use LeaderLine:', err);
    });

    biomeDomElements.forEach((biomeDom, biome) => {
        const biomeObj = biomeService.getBiomeObject(biome);
        const difficulty = difficultyService.getCurrent();

        const title = document.createElement('h2');
        title.className = 'font-bold text-lg';
        title.textContent = biomeObj? spoilerProtectionService.mask(biomeObj).name: biome;

        
        const wiki = document.createElement('a')
        wiki.className = 'link-dc ml-1 icon-[majesticons--open]';
        wiki.href = biomeService.getWikiURL(biome);
        wiki.target = '_blank';
        title.appendChild(wiki)
        
        const scrolls = biomeObj?.scrolls[difficulty];
        const scrollCount = document.createElement('span');
        const scrollIcon = document.createElement('span');
        scrollIcon.className = 'icon-[majesticons--scroll]';
        const scrollLabel = document.createElement('span');
        scrollLabel.textContent = scrolls? `${Math.floor(routeService.flattenCount(scrolls))}`: '-';
        scrollCount.title = "Scrolls in this Level: " + (scrolls? `${scrolls.power} Power + ${scrolls.cursed} Cursed + ${scrolls.dual} Dual + ${scrolls.fragment} Fragments`: 'data unavailable');
        scrollCount.replaceChildren(scrollIcon, scrollLabel);
        
        const commulativeScrolls = routeService.scrollCount(biome);
        const commulativeScrollCount = document.createElement('span');
        const commulativeScrollIcon = document.createElement('span');
        commulativeScrollIcon.className = 'icon-[majesticons--scroll-text]';
        const commulativeScrollLabel = document.createElement('span');
        commulativeScrollLabel.textContent = commulativeScrolls? `${Math.floor(routeService.flattenCount(commulativeScrolls))}`: '-';
        commulativeScrollCount.className = 'px-2';
        commulativeScrollCount.title = "Scrolls in this Route: " + (commulativeScrolls? `${commulativeScrolls.power} Power + ${commulativeScrolls.cursed} Cursed + ${commulativeScrolls.dual} Dual + ${commulativeScrolls.fragment} Fragments`: 'data unavailable');
        commulativeScrollCount.replaceChildren(commulativeScrollIcon, commulativeScrollLabel);

        const icons = document.createElement('div');
        icons.className = 'absolute top-0 left-0 m-1 flex';
        const tags = document.createElement('div');
        tags.className = 'absolute top-0 right-0 flex'

        const dlc = biomeObj!.dlc || null;
        if(dlc !== null) {
            const dlcDom = dlcService.getDom(dlc);
            dlcDom.classList.add('text-xs', 'bg-black', 'px-2');
            tags.appendChild(dlcDom);
        }
        
        const type = biomeObj?.type ||  BiomeType.Standard;
        if(type == BiomeType.Boss) {
            const typeDom = document.createElement('span');
            typeDom.className = 'icon-[majesticons--skull] bg-dc-red';
            typeDom.title = 'Boss';
            icons.appendChild(typeDom);
        }

        if(dlcService.isDisabled(dlc)) {
            const dlcStatus = document.createElement('span');
            dlcStatus.className = 'icon-[majesticons--lock] bg-dc-red';
            dlcStatus.title = 'Locked DLC'
            icons.appendChild(dlcStatus);
        }
        
        biomeDom.replaceChildren(
            tags, 
            icons, 
            title, 
            scrollCount, 
            commulativeScrollCount
        );
    });

    eventEmitter.emit('route-panel-reset');
}

function createBiomeDom(biome: string): HTMLElement {
    const height = 100; //px
    const placeholderAspect = 598 / 168;
    const width = height * placeholderAspect;

    const biomeDom = document.createElement('button');
    const placeholderUrl = `${import.meta.env.BASE_URL}biome_placeholder.svg`;
    const actualUrl = biomeService.getImageURL(biome);
    biomeDom.className = `
        p-2 inline-block relative bg-center bg-no-repeat z-10
        cursor-pointer active:outline-2 
        bg-[length:100%_100%] hover:bg-[length:110%_110%] transition-[background-size] duration-400 ease-out
    `;
    biomeDom.style.height = `${height}px`;
    biomeDom.style.width = `${width}px`;
    biomeDom.style.minWidth = `${width}px`;
    biomeDom.style.backgroundImage = `url(${placeholderUrl})`;

    const img = new Image();
    img.src = actualUrl;
    img.onload = () => biomeDom.style.backgroundImage = darkenedBackground(actualUrl);

    return biomeDom;
}

function createLevelDom(level: BiomeLevel): HTMLElement {
    const levelDom = document.createElement('div');
    levelDom.className = 'border-dashed border-dc-separator py-8 relative'; 
    if(level != BiomeLevel.L1) levelDom.classList.add('border-t-1');

    const levelName = document.createElement('span');
    levelName.innerHTML = biomeLevelService.getName(level);
    levelName.className = 'absolute left-0 top-0 text-sm font-bold text-dc-separator';
        
    levelDom.appendChild(levelName);

    const biomes = document.createElement('div');
    biomes.className = 'overflow-x-auto flex justify-center-safe gap-4';
    biomeService.getBiomesByLevel(level).forEach(b => {
        const biomeDom = biomeDomElements.get(b);
        if (biomeDom) biomes.appendChild(biomeDom);
    });

    levelDom.appendChild(biomes);
    return levelDom;
}

export function RoutePanel(_biomeService: BiomeService): HTMLElement {
    const panel = document.createElement('div');
    routePanelElement = panel;
    routePanelElement.className = 'p-4 relative overflow-hidden';
    
    biomeService = _biomeService;
    routeService = new RouteService(biomeService);
    biomeService.getAllBiomes().forEach(b => biomeDomElements.set(b, createBiomeDom(b)));
    biomeLevelService.getAll().forEach(l => {
        const levelDom = createLevelDom(l);
        routePanelElement?.appendChild(levelDom);
    });
    
    resetRoutePanel();
    eventEmitter.on('control-panel-reset', resetRoutePanel);
    window.onresize = () => repositionLeaderLines(routePanelElement!);
    return panel;
}