import { difficultyService } from "../services/DifficultyService"
import { dlcService } from "../services/DLCService"
import { Difficulty } from "../models/Difficulty"
import { DLC } from "../models/Dlc"
import { spoilerProtectionService } from "../services/SpoilerProtectionService"
import { resetRoutePanel } from "./RoutePanel"

interface FormState {
  difficulty: Difficulty
  dlcs: Set<DLC>
  spoilerProtection: boolean
}

function DifficultySelector(): HTMLElement {
  const container = document.createElement('div')
  container.className = 'flex flex-col items-start gap-1 py-2 px-6'

  const label = document.createElement('p')
  label.className = 'text-dc-gold text-sm text-left'
  label.textContent = 'Boss Cells'
  container.appendChild(label)

  const radioContainer = document.createElement('div')
  radioContainer.className = 'flex flex-row flex-wrap gap-1'

  difficultyService.getAll().forEach(difficulty => {
    const radioLabel = document.createElement('label')
    radioLabel.className = 'flex items-center gap-2 cursor-pointer px-1'

    const difficultyRadio = document.createElement('input')
    difficultyRadio.type = 'radio'
    difficultyRadio.name = 'boss-cell'
    difficultyRadio.value = difficulty.toString()
    difficultyRadio.className = 'radio-dc'
    if (difficulty === difficultyService.getCurrent()) {
      difficultyRadio.checked = true
    }

    const span = document.createElement('span')
    span.className = 'text-dc-gold-light text-sm'
    span.textContent = difficultyService.getName(difficulty)

    radioLabel.appendChild(difficultyRadio)
    radioLabel.appendChild(span)
    radioContainer.appendChild(radioLabel)
  })

  container.appendChild(radioContainer)
  return container
}

function DlcSelector(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'flex flex-col items-start gap-1 py-2 px-6'
  
  const label = document.createElement('p')
  label.className = 'text-dc-gold text-sm text-left'
  label.textContent = 'DLCs'
  container.appendChild(label)

  const checkboxContainer = document.createElement('div')
  checkboxContainer.className = 'flex flex-row flex-wrap gap-1'

  dlcService.getAll().forEach(dlc => {
    const checkbox = document.createElement('label')
    checkbox.className = 'flex items-center gap-2 cursor-pointer px-1'

    const checkboxInput = document.createElement('input')
    checkboxInput.type = 'checkbox'
    checkboxInput.className = 'checkbox-dc'
    checkboxInput.name = 'dlc'
    checkboxInput.value = dlc as string
    checkboxInput.checked = dlcService.isEnabled(dlc)

    const checkboxLabel = dlcService.getDom(dlc);
    checkboxLabel.classList.add('text-sm')

    checkbox.appendChild(checkboxInput)
    checkbox.appendChild(checkboxLabel)
    checkboxContainer.appendChild(checkbox)
  })

  container.appendChild(checkboxContainer)
  return container;
}

function SpoilerProtectionToggle(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'flex flex-col items-start justify-center gap-1 py-2 px-6'
  
  const label = document.createElement('label')
  label.className = 'flex items-center gap-2 cursor-pointer w-fit'

  const checkbox = document.createElement('input')
  checkbox.type = 'checkbox'
  checkbox.id = 'spoiler-protection'
  checkbox.name = 'spoiler-protection'
  checkbox.className = 'checkbox-dc'
  checkbox.checked = spoilerProtectionService.isEnabled()

  const span = document.createElement('span')
  span.className = 'text-dc-gold text-sm'
  span.textContent = 'Spoiler protection'

  label.appendChild(checkbox)
  label.appendChild(span)
  container.appendChild(label)

  return container;
}

function ActionButtons(): HTMLElement {
  const container = document.createElement('div')
  container.className = 'flex flex-row justify-between gap-1 py-2 px-6'

  const applyButton = document.createElement('button')
  applyButton.type = 'submit'
  applyButton.className = 'btn-dc-primary'
  applyButton.textContent = 'Apply'
  applyButton.disabled = true

  const cancelButton = document.createElement('button')
  cancelButton.type = 'button'
  cancelButton.className = 'btn-dc-secondary'
  cancelButton.textContent = 'Cancel'
  cancelButton.disabled = true

  container.appendChild(applyButton)
  container.appendChild(cancelButton)

  return container
}

function getFormState(form: HTMLFormElement): FormState {
  const formData = new FormData(form)
  
  const difficulty = parseInt(formData.get('boss-cell') as string) as Difficulty
  
  const dlcs = new Set<DLC>()
  formData.getAll('dlc').forEach(dlc => {
    dlcs.add(dlc as DLC)
  })

  const spoilerProtection = formData.get('spoiler-protection') === 'on'

  return { difficulty, dlcs, spoilerProtection }
}

function getSavedState(): FormState {
  return {
    difficulty: difficultyService.getCurrent(),
    dlcs: new Set(dlcService.getEnabled()),
    spoilerProtection: spoilerProtectionService.isEnabled()
  }
}

function hasChanges(formState: FormState, savedState: FormState): boolean {
  if (formState.difficulty !== savedState.difficulty) return true
  if (formState.spoilerProtection !== savedState.spoilerProtection) return true
  
  // Check DLC changes
  if (formState.dlcs.size !== savedState.dlcs.size) return true
  for (const dlc of formState.dlcs) {
    if (!savedState.dlcs.has(dlc)) return true
  }
  
  return false
}

export function ControlPanel(): HTMLElement {
  const panel = document.createElement('div')
  panel.className = 'p-3 banner-dc'

  const form = document.createElement('form')
  form.className = 'flex flex-row flex-wrap gap-2 justify-center'

  const difficultySelector = DifficultySelector()
  const dlcSelector = DlcSelector()
  const spoilerToggle = SpoilerProtectionToggle()
  const actionButtons = ActionButtons()

  form.appendChild(difficultySelector)
  form.appendChild(dlcSelector)
  form.appendChild(spoilerToggle)
  form.appendChild(actionButtons)

  // Get button references
  const applyButton = actionButtons.querySelector('button[type="submit"]') as HTMLButtonElement
  const cancelButton = actionButtons.querySelector('button[type="button"]') as HTMLButtonElement

  // Update button states
  function updateButtonStates() {
    const formState = getFormState(form)
    const savedState = getSavedState()
    const changed = hasChanges(formState, savedState)
    
    applyButton.disabled = !changed
    cancelButton.disabled = !changed
  }

  // Listen to form changes
  form.addEventListener('change', updateButtonStates)

  // Handle form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault()
    
    const formState = getFormState(form)
    
    // Apply difficulty
    difficultyService.set(formState.difficulty)
    
    // Apply DLCs
    dlcService.getAll().forEach(dlc => {
      if (formState.dlcs.has(dlc)) {
        dlcService.enable(dlc)
      } else {
        dlcService.disable(dlc)
      }
    })
    
    // Apply spoiler setting
    formState.spoilerProtection? spoilerProtectionService.enable(): spoilerProtectionService.disable();
    
    console.log('Settings applied:', formState)
    
    // Reset the route panel with new settings
    resetRoutePanel()
    
    updateButtonStates()
  })

  // Handle cancel
  cancelButton.addEventListener('click', () => {
    const savedState = getSavedState()
    
    // Reset difficulty
    const difficultyRadios = form.querySelectorAll('input[name="boss-cell"]')
    difficultyRadios.forEach(radio => {
      const input = radio as HTMLInputElement
      input.checked = parseInt(input.value) === savedState.difficulty
    })
    
    // Reset DLCs
    const dlcCheckboxes = form.querySelectorAll('input[name="dlc"]')
    dlcCheckboxes.forEach(checkbox => {
      const input = checkbox as HTMLInputElement
      input.checked = savedState.dlcs.has(input.value as DLC)
    })
    
    // Reset spoilers
    const spoilerCheckbox = form.querySelector('input[name="spoiler-protection"]') as HTMLInputElement
    spoilerCheckbox.checked = savedState.spoilerProtection
    
    updateButtonStates()
  })

  panel.appendChild(form)
  return panel
}
