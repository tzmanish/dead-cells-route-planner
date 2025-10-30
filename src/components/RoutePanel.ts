import type { Biome, Difficulty } from "../models/Biome";
import { biomeService } from "../services/BiomeService";

let visitedBiomes: Biome[] = [];
let biomeChoices: Biome[] = [];
let difficulty: Difficulty = 4;

function renderBiome(biome: Biome) {
    const button = document.createElement('button');
    button.textContent = biome.name;
    button.addEventListener('click', ()=>{
        visitedBiomes.push(biome);
        biomeChoices = biome.exits[difficulty]
            .map(b => biomeService.getBiomeByName(b))
            .filter((biome): biome is Biome => biome !== undefined);
        refreshBiomes();
    });
    button.classList.add('p-4');
    return button;
}

function refreshBiomes() {
    const routePanelElement = document.getElementById("route-panel")
    if (!routePanelElement) {
        console.error('Route panel element not found');
        return;
    }
    routePanelElement.innerHTML = '';
    visitedBiomes.forEach(biome => {
        const button = renderBiome(biome);
        button.disabled = true;
        routePanelElement?.appendChild(button);
    });
    biomeChoices.forEach(biome => {
        const button = renderBiome(biome);
        routePanelElement?.appendChild(button);
    })
}

export function RoutePanel(): string {
    biomeService.init().then(() => {
        biomeChoices = biomeService.getBiomesByLevel(1);
        refreshBiomes();
    });
    
    return `<div id="route-panel" class="route-panel">
        <div class="loading">Loading biomes...</div>
    </div>`;
}