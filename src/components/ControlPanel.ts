import { difficultyService } from "../services/DifficultyService"
import { dlcService } from "../services/DLCService"
import { Difficulty } from "../models/Difficulty"
import { DLC } from "../models/Dlc"
import { spoilerProtectionService } from "../services/SpoilerProtectionService"
import { eventEmitter } from "../services/EventEmitterService"
import { viewService } from "../services/ViewService"
import { ViewStrategy } from "../models/View"

interface FormState {
  difficulty: Difficulty
  dlcs: Set<DLC>
  spoilerProtection: boolean
  viewStrategy: ViewStrategy
}

function getFormState(form: HTMLFormElement): FormState {
  const formData = new FormData(form)
  
  const difficulty = parseInt(formData.get('boss-cell') as string) as Difficulty
  
  const dlcs = new Set<DLC>()
  formData.getAll('dlc').forEach(dlc => {
    dlcs.add(dlc as DLC)
  })

  const spoilerProtection = formData.get('spoiler-protection') === 'on'
  const viewStrategy = formData.get('view-strategy') === 'on'? ViewStrategy.Dynamic: ViewStrategy.Static

  return { difficulty, dlcs, spoilerProtection, viewStrategy }
}

function getSavedState(): FormState {
  return {
    difficulty: difficultyService.getCurrent(),
    dlcs: new Set(dlcService.getEnabled()),
    spoilerProtection: spoilerProtectionService.isEnabled(),
    viewStrategy: viewService.getStrategy()
  }
}

function hasChanges(formState: FormState, savedState: FormState): boolean {
  if (formState.difficulty !== savedState.difficulty) return true
  if (formState.spoilerProtection !== savedState.spoilerProtection) return true
  if (formState.viewStrategy !== savedState.viewStrategy) return true
  
  if (formState.dlcs.size !== savedState.dlcs.size) return true
  for (const dlc of formState.dlcs) {
    if (!savedState.dlcs.has(dlc)) return true
  }
  
  return false
}

function createContainer(): HTMLElement {
  const container = document.createElement('div')
  container.className = 'flex flex-col items-start gap-1 py-2 px-6'
  return container;
}

function DifficultySelector(): HTMLElement {
  const container = createContainer();

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
  const container = createContainer();
  
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
  return label;
}

function ViewStrategyToggle(): HTMLElement {
  const label = document.createElement('label')
  label.className = 'flex items-center gap-2 cursor-pointer w-fit'

  const checkbox = document.createElement('input')
  checkbox.type = 'checkbox'
  checkbox.id = 'view-strategy'
  checkbox.name = 'view-strategy'
  checkbox.className = 'checkbox-dc'
  checkbox.checked = viewService.getStrategy() == ViewStrategy.Dynamic;
  checkbox.disabled = true;

  const span = document.createElement('span')
  span.className = 'text-dc-gold text-sm'
  span.textContent = 'Advanced Mode'

  label.appendChild(checkbox)
  label.appendChild(span)
  return label;
}

function ActionButtons(form: HTMLFormElement): HTMLElement {
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

  const updateButtonStates = () => {
    const formState = getFormState(form)
    const savedState = getSavedState()
    const changed = hasChanges(formState, savedState)
    applyButton.disabled = !changed
    cancelButton.disabled = !changed
  };

  form.addEventListener('change', updateButtonStates);
  eventEmitter.on('control-panel-reset', updateButtonStates);

  cancelButton.addEventListener('click', () => {
    const savedState = getSavedState();

    const difficultyRadios = form.querySelectorAll('input[name="boss-cell"]')
    difficultyRadios.forEach(radio => {
      const input = radio as HTMLInputElement
      input.checked = parseInt(input.value) === savedState.difficulty
    });
    
    const dlcCheckboxes = form.querySelectorAll('input[name="dlc"]')
    dlcCheckboxes.forEach(checkbox => {
      const input = checkbox as HTMLInputElement
      input.checked = savedState.dlcs.has(input.value as DLC)
    });
    
    const spoilerCheckbox = form.querySelector('input[name="spoiler-protection"]') as HTMLInputElement;
    spoilerCheckbox.checked = savedState.spoilerProtection;
    
    const viewStrategy = form.querySelector('input[name="view-strategy"]') as HTMLInputElement;
    viewStrategy.checked = savedState.viewStrategy == ViewStrategy.Dynamic;

    updateButtonStates();
  })

  container.appendChild(applyButton)
  container.appendChild(cancelButton)
  return container
}

export function ControlPanel(): HTMLElement {
  const panel = document.createElement('div')
  panel.className = 'p-3 banner-dc'

  const form = document.createElement('form')
  form.className = 'flex flex-row flex-wrap gap-2 justify-center'

  const difficultySelector = DifficultySelector()
  const dlcSelector = DlcSelector()
  const spoilerToggle = SpoilerProtectionToggle()
  const viewStrategyToggle = ViewStrategyToggle()
  const actionButtons = ActionButtons(form)

  const checkboxContainer = createContainer();
  checkboxContainer.appendChild(spoilerToggle);
  checkboxContainer.appendChild(viewStrategyToggle);

  form.appendChild(difficultySelector)
  form.appendChild(dlcSelector)
  form.appendChild(checkboxContainer)
  form.appendChild(actionButtons)

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formState = getFormState(form);
    difficultyService.set(formState.difficulty);
    dlcService.getAll().forEach(dlc => {
      if (formState.dlcs.has(dlc)) {
        dlcService.enable(dlc)
      } else {
        dlcService.disable(dlc)
      }
    });
    formState.spoilerProtection? spoilerProtectionService.enable(): spoilerProtectionService.disable();
    formState.viewStrategy? viewService.setStrategy(ViewStrategy.Dynamic): viewService.setStrategy(ViewStrategy.Static);
    
    console.log('Settings applied:', formState)
    eventEmitter.emit('control-panel-reset', formState);
  })

  panel.appendChild(form)
  return panel
}
