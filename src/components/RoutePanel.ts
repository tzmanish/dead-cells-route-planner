import type { Biome } from "../models/Biome";
import type { BiomeService } from "../services/BiomeService";
import { Difficulty } from "../models/Difficulty";
import { biomeServiceReference } from "../services/BiomeService";
import { difficultyService } from "../services/DifficultyService";

let visitedBiomes: Biome[] = [];
let biomeChoices: Biome[] = [];
let difficulty: Difficulty = difficultyService.getCurrent();
let routePanelElement: HTMLElement | null = null;

function renderBiome(biome: Biome, service: BiomeService) {
    const button = document.createElement('button');
    button.textContent = biome.name;
    button.addEventListener('click', ()=>{
        visitedBiomes.push(biome);
        biomeChoices = biome.exits[difficulty]
            .map(b => service.getBiomeByName(b))
            .filter((biome): biome is Biome => biome !== undefined);
        if (routePanelElement) {
            refreshBiomes(service);
        }
    });
    button.classList.add('p-4');
    return button;
}

function refreshBiomes(service: BiomeService) {
    if(!routePanelElement) return;
    const panel = routePanelElement; // Store in local variable for type safety
    panel.innerHTML = '';
    visitedBiomes.forEach(biome => {
        const button = renderBiome(biome, service);
        button.disabled = true;
        panel.appendChild(button);
    });
    biomeChoices.forEach(biome => {
        const button = renderBiome(biome, service);
        panel.appendChild(button);
    })
}

export function RoutePanel(): HTMLElement {
    const panel = document.createElement('div');
    panel.id = 'route-panel';
    panel.className = 'route-panel';
    routePanelElement = panel; // Store reference for later use
    
    const loading = document.createElement('div');
    loading.className = 'loading';
    loading.textContent = 'Loading biomes...';
    panel.appendChild(loading);
    
    biomeServiceReference.then((service) => {
        biomeChoices = service.getBiomesByLevel(1);
        refreshBiomes(service);
    });
    
    return panel;
}