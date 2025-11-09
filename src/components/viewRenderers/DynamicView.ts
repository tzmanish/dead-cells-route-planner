import { BiomeType } from "../../models/Biome";
import { BiomeLevel } from "../../models/BiomeLevel";
import { Difficulty } from "../../models/Difficulty";
import type { ViewRenderer } from "../../models/View";
import { biomeService } from "../../services/BiomeService";
import { difficultyService } from "../../services/DifficultyService";
import { dlcService } from "../../services/DLCService";
import { eventEmitter } from "../../services/EventEmitterService";
import { routeService } from "../../services/RouteService";
import { spoilerProtectionService } from "../../services/SpoilerProtectionService";
import { darkenedBackgroundImage } from "../../utils/Helper";

export class DynamicView implements ViewRenderer {
    routePanelElement: HTMLElement;
    breadcrumb: HTMLElement;
    choicePanel: HTMLElement;
    biomeChoiceDomElements = new Map<string, HTMLElement>();
    biomeBreadcrumbDomElements = new Map<string, HTMLElement>();
    popper: HTMLElement;
    private refreshHandler = () => this.refresh();

    constructor() {
        this.routePanelElement = document.createElement('div');
        this.routePanelElement.className = 'p-4 relative overflow-hidden';

        this.popper = document.createElement('div');
        this.popper.className = 'fixed z-1000 w-auto h-auto bg-black/60 p-2 text-xs text-white';
        this.popper.hidden = true;
        this.routePanelElement.appendChild(this.popper);
        
        this.breadcrumb = document.createElement('div');
        this.breadcrumb.className = 'flex flex-wrap';
        
        this.choicePanel = document.createElement('div');
        this.choicePanel.className = 'flex flex-wrap justify-center p-4';

        const resetButton = document.createElement('button');
        resetButton.title = 'Reset';
        resetButton.className = 'icon-[majesticons--reload-circle] m-0 p-0 text-5xl fixed bottom-[120px] right-[80px] z-100 btn-dc-primary';
        resetButton.onclick = this.refreshHandler;
        this.routePanelElement.appendChild(resetButton);
        this.routePanelElement.appendChild(this.breadcrumb);
        this.routePanelElement.appendChild(this.choicePanel);

        this.reset();
    }
    
    private createBiomeChoiceDom(biome: string, difficultyReq?: Difficulty): HTMLElement {
        const cachedBiome = this.biomeChoiceDomElements.get(biome);
        if(cachedBiome) return cachedBiome;

        const height = 100; //px
        const placeholderAspect = 598 / 168;
        const width = height * placeholderAspect;

        const biomeDom = document.createElement('button');
        const placeholderUrl = `${import.meta.env.BASE_URL}biome_placeholder.svg`;
        const actualUrl = biomeService.getImageURL(biome);
        biomeDom.className = 'p-2 m-1 flex flex-col relative items-center justify-center gap-2 bg-center bg-no-repeat z-10 bg-[length:100%_100%] enabled:hover:bg-[length:110%_110%] enabled:cursor-pointer disabled:opacity-50 transition-[background-size] duration-400 ease-out active:border';
        biomeDom.style.height = `${height}px`;
        biomeDom.style.width = `${width}px`;
        biomeDom.style.minWidth = `${width}px`;
        biomeDom.style.backgroundImage = `url(${placeholderUrl})`;

        const img = new Image();
        img.src = actualUrl;
        img.onload = () => biomeDom.style.backgroundImage = darkenedBackgroundImage(actualUrl);

        const biomeObj = biomeService.getBiomeObject(biome);
        const difficulty = difficultyService.getCurrent();

        const title = document.createElement('h2');
        title.className = 'font-bold text-lg';

        const biomeName = document.createElement('span');
        biomeName.className = 'has-info';
        biomeName.textContent = biomeObj? spoilerProtectionService.mask(biomeObj).name: biome;
        biomeName.title = biomeObj?.desc[Math.floor(Math.random() * biomeObj.desc.length)]||biome;

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
        scrollCount.title = `Scrolls in ${biome}: ${(scrolls? `${scrolls.power} Power + ${scrolls.cursed} Cursed + ${scrolls.dual} Dual + ${scrolls.fragment} Fragments`: 'data unavailable')}`;
        
        const commulativeScrolls = routeService.scrollCount(biome);
        const commulativeScrollCount = document.createElement('span');
        const commulativeScrollIcon = document.createElement('span');
        commulativeScrollIcon.className = 'icon-[majesticons--scroll-text]';
        const commulativeScrollLabel = document.createElement('span');
        commulativeScrollLabel.textContent = commulativeScrolls? `${Math.floor(routeService.flattenCount(commulativeScrolls))}`: '-';
        commulativeScrollLabel.className = 'has-info';
        commulativeScrollCount.replaceChildren(commulativeScrollIcon, commulativeScrollLabel);
        commulativeScrollCount.title = `Scrolls in this Route: ${(commulativeScrolls? `${commulativeScrolls.power} Power + ${commulativeScrolls.cursed} Cursed + ${commulativeScrolls.dual} Dual + ${commulativeScrolls.fragment} Fragments`: 'data unavailable')}`;

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

        if(difficultyReq) {
            const difficultyInfo = document.createElement('span');
            difficultyInfo.className = 'bg-dc-red text-xs px-1 rounded-full';
            difficultyInfo.title = `${difficultyReq}BC required`;
            difficultyInfo.textContent = `${difficultyReq}BC`;
            icons.appendChild(difficultyInfo);
        }
        
        biomeDom.replaceChildren(
            tags, 
            icons, 
            title, 
            props
        );

        biomeDom.onclick = () => {
            this.addToBreadcrumb(biome);
            this.populateChoices(biome);
        };

        if(biomeObj?.dlc && dlcService.isDisabled(biomeObj.dlc)) biomeDom.disabled = true;
        if(difficultyReq && difficultyReq > difficultyService.getCurrent()) biomeDom.disabled = true;

        this.biomeChoiceDomElements.set(biome, biomeDom);
        return biomeDom;
    }

    private addToBreadcrumb(biome: string) {
        const separator = document.createElement('span');
        separator.textContent = '>'
        separator.className = 'px-2 text-dc-red';
        this.breadcrumb.appendChild(separator);

        const biomeDom = this.createBiomeBreadcrumbDom(biome)
        this.breadcrumb.appendChild(biomeDom);
    }

    private populateChoices(biome: string) {
        this.choicePanel.replaceChildren();
        const biomeObj = biomeService.getBiomeObject(biome);
        biomeObj?.exits[Difficulty.BC4].forEach(b => {
            const minLevelReq: Difficulty = biomeObj.exits[Difficulty.BC0].some(e => e == b)? Difficulty.BC0:
                biomeObj.exits[Difficulty.BC1].some(e => e == b)? Difficulty.BC1:
                biomeObj.exits[Difficulty.BC2].some(e => e == b)? Difficulty.BC2:
                biomeObj.exits[Difficulty.BC3].some(e => e == b)? Difficulty.BC3: 
                Difficulty.BC4;

            const biome = this.createBiomeChoiceDom(b, minLevelReq);
            this.choicePanel.appendChild(biome);
        });
    }

    private createBiomeBreadcrumbDom(biome: string): HTMLElement {
        const cachedBiome = this.biomeBreadcrumbDomElements.get(biome);
        if(cachedBiome) return cachedBiome;

        const biomeDom = document.createElement('button');
        biomeDom.className = 'link-dc'
        biomeDom.textContent = biome;
        biomeDom.onclick = () => {
            let next = biomeDom.nextElementSibling;
            while(next) {
                const tmp = next.nextElementSibling;
                next.remove();
                next = tmp;
            }
            this.populateChoices(biome);
        };

        this.biomeBreadcrumbDomElements.set(biome, biomeDom);
        return biomeDom;
    }

    private reset(): void {
        const firstBiome = biomeService.getBiomesByLevel(BiomeLevel.L1)[0];
        const biomeDom = this.createBiomeBreadcrumbDom(firstBiome);
        this.breadcrumb.replaceChildren(biomeDom);
        this.populateChoices(firstBiome);
    }

    public render(): HTMLElement {
        eventEmitter.on('control-panel-reset', this.refreshHandler);
        requestAnimationFrame(this.refreshHandler);
        return this.routePanelElement;
    }

    public refresh(): void {
        routeService.recalculate();
        this.biomeChoiceDomElements.clear();
        this.reset();
    }

    public clear(): void {
        eventEmitter.clear('control-panel-reset', this.refreshHandler);
    }
}