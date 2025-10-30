import './style.css'
import { Header } from './components/Header'
import { MainContent } from './components/MainContent'
import { Footer } from './components/Footer'

const app = document.querySelector<HTMLDivElement>('#app')!
const container = document.createElement('div')
container.className = 'flex flex-col min-h-screen bg-dc-dark'

container.appendChild(Header());
container.appendChild(MainContent());
container.appendChild(Footer());

app.appendChild(container)