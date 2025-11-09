import { biomeLevelService } from "../../services/BiomeLevelService";
import { BiomeLevel } from "../../models/BiomeLevel";
import { difficultyService } from "../../services/DifficultyService";
import { eventEmitter } from "../../services/EventEmitterService";
import { dlcService } from "../../services/DLCService";
import { BiomeType } from "../../models/Biome";
import { spoilerProtectionService } from "../../services/SpoilerProtectionService";
import { reposition } from 'nanopop';
import { biomeService } from "../../services/BiomeService";
import { routeService } from "../../services/RouteService";
import { leaderLine } from "../../utils/LeaderLine";
import type { ViewRenderer } from "../../models/View";
import { darkenedBackgroundImage } from "../../utils/Helper";

export class StaticView implements ViewRenderer {
    routePanelElement: HTMLElement;
    biomeDomElements = new Map<string, HTMLElement>();
    popper: HTMLElement;
    private resizeHandler = () => leaderLine.reposition(this.routePanelElement);
    private refreshHandler = () => this.refresh();

    constructor() {
        this.routePanelElement = document.createElement('div');
        this.routePanelElement.className = 'p-4 relative overflow-hidden';

        this.popper = document.createElement('div');
        this.popper.className = 'fixed z-1000 w-auto h-auto bg-black/60 p-2 text-xs text-white';
        this.popper.hidden = true;
        this.routePanelElement.appendChild(this.popper);

        biomeService.getAllBiomes().forEach(b => this.biomeDomElements.set(b, this.createBiomeDom(b)));
        biomeLevelService.getAll().forEach(l => {
            const levelDom = this.createLevelDom(l);
            this.routePanelElement?.appendChild(levelDom);
        });
    }

    public render(): HTMLElement {
        eventEmitter.on('control-panel-reset', this.refreshHandler);
        window.addEventListener('resize', this.resizeHandler);
        requestAnimationFrame(this.refreshHandler);
        return this.routePanelElement;
    }

    public refresh(): void {
        routeService.recalculate();

        if(this.routePanelElement) leaderLine.reset(this.routePanelElement);
        
        const entryBiome = biomeService.getBiomesByLevel(BiomeLevel.L1)[0];
        let current = entryBiome;
        let e_current = this.biomeDomElements.get(current);
        let next = routeService.getNextBiome(current);
        let e_next = this.biomeDomElements.get(next||"");

        while(next) {
            if(e_current && e_next) leaderLine.create(e_current, e_next, {
                startSocket: 'bottom', 
                endSocket: 'top', 
                color: '#f9cf87', 
                size: 1.2, 
                path: 'grid'
            });

            e_next?.scrollIntoView();
            e_current = e_next;
            next = routeService.getNextBiome(next);
            e_next = this.biomeDomElements.get(next||"");
        }
        window.scrollTo(0, 0);

        this.biomeDomElements.forEach((biomeDom, biome) => {
            const biomeObj = biomeService.getBiomeObject(biome);
            const difficulty = difficultyService.getCurrent();

            const title = document.createElement('h2');
            title.className = 'font-bold text-lg';

            const biomeName = document.createElement('span');
            biomeName.className = 'has-info';
            biomeName.textContent = biomeObj? spoilerProtectionService.mask(biomeObj).name: biome;
            biomeName.addEventListener('mouseover', ()=>this.showPopper(biomeName, biomeObj?.desc[Math.floor(Math.random() * biomeObj.desc.length)]||biome));

            const wiki = document.createElement('a');
            wiki.className = 'link-dc ml-1 icon-[majesticons--open]';
            wiki.href = biomeService.getWikiURL(biome);
            wiki.title = 'wiki';
            wiki.target = '_blank';
            
            title.replaceChildren(biomeName, wiki);
            
            const props = document.createElement('div');
            props.className = 'flex gap-2 text-base';

            const scrolls = biomeObj?.scrolls[difficulty];
            const scrollCount = document.createElement('span');
            const scrollIcon = document.createElement('span');
            scrollIcon.className = 'icon-[majesticons--scroll]';
            const scrollLabel = document.createElement('span');
            scrollLabel.textContent = scrolls? `${Math.floor(routeService.flattenCount(scrolls))}`: '-';
            scrollLabel.className = 'has-info';
            scrollCount.replaceChildren(scrollIcon, scrollLabel);
            scrollLabel.addEventListener('mouseover', ()=>this.showPopper(scrollLabel, `Scrolls in ${biome}: ${(scrolls? `${scrolls.power} Power + ${scrolls.cursed} Cursed + ${scrolls.dual} Dual + ${scrolls.fragment} Fragments`: 'data unavailable')}`));
            
            const commulativeScrolls = routeService.scrollCount(biome);
            const commulativeScrollCount = document.createElement('span');
            const commulativeScrollIcon = document.createElement('span');
            commulativeScrollIcon.className = 'icon-[majesticons--scroll-text]';
            const commulativeScrollLabel = document.createElement('span');
            commulativeScrollLabel.textContent = commulativeScrolls? `${Math.floor(routeService.flattenCount(commulativeScrolls))}`: '-';
            commulativeScrollLabel.className = 'has-info';
            commulativeScrollCount.replaceChildren(commulativeScrollIcon, commulativeScrollLabel);
            commulativeScrollLabel.addEventListener('mouseover', ()=>this.showPopper(commulativeScrollLabel, `Scrolls in this Route: ${(commulativeScrolls? `${commulativeScrolls.power} Power + ${commulativeScrolls.cursed} Cursed + ${commulativeScrolls.dual} Dual + ${commulativeScrolls.fragment} Fragments`: 'data unavailable')}`));

            props.replaceChildren(scrollCount, commulativeScrollCount);

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
                props
            );
        });

        eventEmitter.emit('route-panel-reset');
    }

    private createLevelDom(level: BiomeLevel): HTMLElement {
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
            const biomeDom = this.biomeDomElements.get(b);
            if (biomeDom) biomes.appendChild(biomeDom);
        });

        levelDom.appendChild(biomes);
        return levelDom;
    }

    private createBiomeDom(biome: string): HTMLElement {
        const height = 100; //px
        const placeholderAspect = 598 / 168;
        const width = height * placeholderAspect;

        const biomeDom = document.createElement('button');
        const placeholderUrl = `${import.meta.env.BASE_URL}biome_placeholder.svg`;
        const actualUrl = biomeService.getImageURL(biome);
        biomeDom.className = 'p-2 m-1 flex flex-col relative items-center justify-center gap-2 bg-center bg-no-repeat z-10 bg-[length:100%_100%] hover:bg-[length:110%_110%] transition-[background-size] duration-400 ease-out';
        biomeDom.style.height = `${height}px`;
        biomeDom.style.width = `${width}px`;
        biomeDom.style.minWidth = `${width}px`;
        biomeDom.style.backgroundImage = `url(${placeholderUrl})`;

        const img = new Image();
        img.src = actualUrl;
        img.onload = () => biomeDom.style.backgroundImage = darkenedBackgroundImage(actualUrl);

        return biomeDom;
    }

    private showPopper(element: HTMLElement, textContent: string) {
        this.popper.textContent = textContent;
        reposition(element, this.popper, { position:'bottom' });
        this.popper.hidden = false;
        element.addEventListener('mouseleave', ()=>{
            this.popper.hidden = true;
        });
    }

    public clear(): void {
        eventEmitter.clear('control-panel-reset', this.refreshHandler);
        window.removeEventListener('resize', this.resizeHandler);
    }
}


