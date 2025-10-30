import { ControlPanel } from './ControlPanel'
import { RoutePanel } from './RoutePanel'

export function MainContent(): HTMLElement {
  const main = document.createElement('main')
  main.className = 'flex-1 px-6'
  
  main.appendChild(ControlPanel())
  main.appendChild(RoutePanel())
  
  return main
}
