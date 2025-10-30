import type { Biome, Difficulty } from "../models/Biome";
import { biomeServiceReference } from "../services/BiomeService";
import type { BiomeService } from "../services/BiomeService";

let visitedBiomes: Biome[] = [];
let biomeChoices: Biome[] = [];
let difficulty: Difficulty = 4;

function renderBiome(biome: Biome, service: BiomeService) {
    const button = document.createElement('button');
    button.textContent = biome.name;
    button.addEventListener('click', ()=>{
        visitedBiomes.push(biome);
        biomeChoices = biome.exits[difficulty]
            .map(b => service.getBiomeByName(b))
            .filter((biome): biome is Biome => biome !== undefined);
        refreshBiomes(service);
    });
    button.classList.add('p-4');
    return button;
}

function refreshBiomes(service: BiomeService) {
    const routePanelElement = document.getElementById("route-panel")
    if (!routePanelElement) {
        console.error('Route panel element not found');
        return;
    }
    routePanelElement.innerHTML = '';
    visitedBiomes.forEach(biome => {
        const button = renderBiome(biome, service);
        button.disabled = true;
        routePanelElement?.appendChild(button);
    });
    biomeChoices.forEach(biome => {
        const button = renderBiome(biome, service);
        routePanelElement?.appendChild(button);
    })
}

export function RoutePanel(): string {
    biomeServiceReference.then((service) => {
        biomeChoices = service.getBiomesByLevel(1);
        refreshBiomes(service);
    });
    
    return `<div id="route-panel" class="route-panel">
        <div class="loading">Loading biomes...</div>
    </div>`;
}