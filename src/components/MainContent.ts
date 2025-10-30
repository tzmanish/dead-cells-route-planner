import { ControlPanel } from './ControlPanel'
import { RoutePanel } from './RoutePanel'

export function MainContent(): string {
  return `
    <main class="flex-1 px-6">
        ${ControlPanel()}
        ${RoutePanel()}
    </main>
  `
}
