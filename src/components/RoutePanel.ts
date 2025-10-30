import type { Biome } from "../models/Biome";
import type { BiomeService } from "../services/BiomeService";
import { Difficulty } from "../models/Difficulty";
import { difficultyService } from "../services/DifficultyService";
import { spoilerProtectionService } from "../services/SpoilerProtectionService";
import { dlcService } from "../services/DLCService";

let visitedBiomes: Biome[] = [];
let biomeChoices: Biome[] = [];
let difficulty: Difficulty = difficultyService.getCurrent();
let routePanelElement: HTMLElement | null = null;
let biomeService: BiomeService;

function renderBiome(biome: Biome, service: BiomeService): HTMLButtonElement {
    const biome_masked = spoilerProtectionService.mask(biome);
    const button = document.createElement('button');
    button.textContent = biome_masked.name;
    button.addEventListener('click', ()=>{
        visitedBiomes.push(biome);
        const exits = biome.exits[difficulty]
            .map(b => service.getBiomeByName(b))
            .filter((biome): biome is Biome => biome !== undefined);
        biomeChoices = dlcService.filterByEnabledDLCs(exits);
        refreshBiomes();
    });
    button.className = 'btn-dc m-2';
    return button;
}

function refreshBiomes() {
    if(!routePanelElement) {
        console.error('routePanelElement is null!');
        return;
    }
    const panel = routePanelElement;
    panel.innerHTML = '';
    visitedBiomes.forEach(biome => {
        const button = renderBiome(biome, biomeService);
        button.disabled = true;
        panel.appendChild(button);
    });

    const choiceContainer = document.createElement('div');
    choiceContainer.className = 'flex flex-wrap'
    biomeChoices.forEach(biome => {
        const button = renderBiome(biome, biomeService);
        choiceContainer.appendChild(button);
    })
    panel.appendChild(choiceContainer);
}

export function resetRoutePanel() {
    visitedBiomes = [];
    difficulty = difficultyService.getCurrent();
    if (biomeService) {
        const exits = biomeService.getBiomesByLevel(1);
        biomeChoices = dlcService.filterByEnabledDLCs(exits);
        refreshBiomes();
    }
}

export function RoutePanel(service: BiomeService): HTMLElement {
    const panel = document.createElement('div');
    panel.id = 'route-panel';
    routePanelElement = panel; // Store reference for later use
    
    biomeService = service;
    const exits = biomeService.getBiomesByLevel(1);
    biomeChoices = dlcService.filterByEnabledDLCs(exits);
    refreshBiomes();
    
    return panel;
}