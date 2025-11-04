import { ControlPanel } from './ControlPanel'
import { RoutePanel } from './RoutePanel'
import { biomeServiceReference } from '../services/BiomeService'

function createLoadingDiv() {
  const loading = document.createElement('div')
  loading.className = 'text-dc-gold text-center p-8 text-xl'
  loading.textContent = 'Initializing Biome Service...'
  return loading;
}

function createErrorDiv() {
  const errorDiv = document.createElement('div')
  errorDiv.className = 'text-red-500 text-center p-8 text-xl'
  errorDiv.textContent = 'Failed to load Biome Service. Please refresh the page.'
  return errorDiv;
}

export function MainContent(): HTMLElement {
  const main = document.createElement('main')
  main.className = 'flex-1'

  main.appendChild(ControlPanel());

  const loadingDiv = createLoadingDiv();
  main.appendChild(loadingDiv);
  biomeServiceReference.then((service) => {
    main.removeChild(loadingDiv)
    main.appendChild(RoutePanel(service))
  }).catch((error) => {
    console.error('Failed to load biome service:', error)
    main.removeChild(loadingDiv)
    main.appendChild(createErrorDiv())
  })
  
  return main
}
