import { difficultyService } from "../services/DifficultyService"
import { dlcService } from "../services/DLCService"

function DifficultySelector() {
  const container = document.createElement('div')
  container.className = 'flex items-center gap-4'

  const label = document.createElement('p')
  label.className = 'text-dc-gold font-bold'
  label.textContent = 'Boss Cells (BC):'
  container.appendChild(label)

  const radioContainer = document.createElement('div')
  radioContainer.className = 'flex flex-wrap gap-2'

  difficultyService.getAll().forEach(difficulty => {
    const radioLabel = document.createElement('label')
    radioLabel.className = 'flex items-center gap-2 cursor-pointer'

    const difficultyRadio = document.createElement('input')
    difficultyRadio.type = 'radio'
    difficultyRadio.name = 'boss-cell'
    difficultyRadio.value = difficulty.toString()
    difficultyRadio.className = 'radio-dc'
    if (difficulty === difficultyService.getCurrent()) {
      difficultyRadio.checked = true
    }

    // Add event listener directly
    difficultyRadio.addEventListener('change', () => {
      difficultyService.set(difficulty)
      console.log('Difficulty changed to:', difficultyService.getName(difficulty))
    })

    const span = document.createElement('span')
    span.className = 'text-dc-gold-light'
    span.textContent = difficultyService.getName(difficulty)

    radioLabel.appendChild(difficultyRadio)
    radioLabel.appendChild(span)
    radioContainer.appendChild(radioLabel)
  })

  container.appendChild(radioContainer)
  return container
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

export function ControlPanel(): HTMLElement {
  const panel = document.createElement('div')
  panel.className = 'banner-dc p-3'
  panel.id = 'control-panel'

  panel.appendChild(DifficultySelector())
  panel.innerHTML += DlcSelector()
  panel.innerHTML += SpoilerToggle()

  return panel
}
