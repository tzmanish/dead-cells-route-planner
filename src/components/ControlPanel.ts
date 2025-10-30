import { Difficulty } from "../models/Difficulty"
import { difficultyService } from "../services/DifficultyService"
import { dlcService } from "../services/DLCService"

function DifficultySelector() {
  return `
    <div class="flex items-center gap-4">
      <p class="text-dc-gold font-bold">Boss Cells (BC):</p>
      <div class="flex flex-wrap gap-2">
        ${difficultyService.getAll().map(difficulty => `
          <label class="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio" 
              name="boss-cell" 
              value="${difficulty}" 
              ${difficulty === Difficulty.BC0 ? 'checked' : ''}
              class="radio-dc"
            />
            <span class="text-dc-gold-light">${difficultyService.getName(difficulty)}</span>
          </label>
        `).join('')}
      </div>
    </div>
  `
}

function DlcSelector() {
  return `
    <div class="flex items-center gap-4">
      <p class="text-dc-gold font-bold">DLCs:</p>
      <div class="flex flex-wrap gap-2">
        ${dlcService.getAll().map(dlc => `
          <label class="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              id="dlc-${dlc}" 
              value="${dlcService.getName(dlc)}"
              checked
              class="checkbox-dc"
            />
            <span class="text-dc-gold-light">${dlc}</span>
          </label>
        `).join('')}
      </div>
    </div>
  `
}

function SpoilerToggle() {
  return `      
    <div>
      <label class="flex items-center gap-2 cursor-pointer w-fit">
        <input 
          type="checkbox" 
          id="spoilers" 
          class="checkbox-dc"
        />
        <span class="text-dc-gold font-bold">Show Spoilers?</span>
      </label>
    </div>
  `
}

export function ControlPanel(): string {
  return `
    <div class="banner-dc p-3" id="control-panel">
      ${DifficultySelector()}
      ${DlcSelector()}
      ${SpoilerToggle()}
    </div>
  `
}
