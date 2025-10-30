import './style.css'
import { Header } from './components/Header'
import { MainContent } from './components/MainContent'
import { Footer } from './components/Footer'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="flex flex-col min-h-screen bg-dc-dark">
    ${Header()}
    ${MainContent()}
    ${Footer()}
  </div>
`