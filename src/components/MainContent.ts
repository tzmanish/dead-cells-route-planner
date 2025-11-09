import { ControlPanel } from './ControlPanel'
import { RoutePanel as StaticView } from './StaticView'

export function MainContent(): HTMLElement {
  const main = document.createElement('main')
  main.className = 'flex-1'

  main.appendChild(ControlPanel());
  main.appendChild(StaticView());
  
  return main
}
