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

function DlcSelector(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'flex items-center gap-4'
  
  const label = document.createElement('p')
  label.className = 'text-dc-gold font-bold'
  label.textContent = 'DLCs:'
  container.appendChild(label)

  const checkboxContainer = document.createElement('div')
  checkboxContainer.className = 'flex flex-wrap gap-2'

  dlcService.getAll().forEach(dlc => {
    const checkboxLabel = document.createElement('label')
    checkboxLabel.className = 'flex items-center gap-2 cursor-pointer'

    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.className = 'checkbox-dc'
    checkbox.name = 'dlc'
    checkbox.value = dlc as string
    checkbox.checked = dlcService.isEnabled(dlc)

    const span = document.createElement('span');
    span.className = 'text-dc-gold-light';
    span.textContent = dlcService.getName(dlc)||"";

    checkboxLabel.appendChild(checkbox)
    checkboxLabel.appendChild(span)
    checkboxContainer.appendChild(checkboxLabel)
  })

  container.appendChild(checkboxContainer)
  return container;
}

function SpoilerProtectionToggle(): HTMLElement {
  const container = document.createElement('div');
  
  const label = document.createElement('label')
  label.className = 'flex items-center gap-2 cursor-pointer w-fit'

  const checkbox = document.createElement('input')
  checkbox.type = 'checkbox'
  checkbox.id = 'spoiler-protection'
  checkbox.name = 'spoiler-protection'
  checkbox.className = 'checkbox-dc'
  checkbox.checked = spoilerProtectionService.isEnabled()

  const span = document.createElement('span')
  span.className = 'text-dc-gold font-bold'
  span.textContent = 'Spoiler protection'

  label.appendChild(checkbox)
  label.appendChild(span)
  container.appendChild(label)

  return container;
}

function ActionButtons(): HTMLElement {
  const container = document.createElement('div')
  container.className = 'flex gap-2'

  const applyButton = document.createElement('button')
  applyButton.type = 'submit'
  applyButton.className = 'px-4 py-2 bg-dc-gold text-dc-dark font-bold rounded hover:bg-dc-gold-light disabled:opacity-50 disabled:cursor-not-allowed'
  applyButton.textContent = 'Apply'
  applyButton.disabled = true

  const cancelButton = document.createElement('button')
  cancelButton.type = 'button'
  cancelButton.className = 'px-4 py-2 bg-gray-600 text-white font-bold rounded hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed'
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
  panel.className = 'banner-dc p-3'
  panel.id = 'control-panel'

  const form = document.createElement('form')
  form.className = 'flex flex-col gap-4'

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
