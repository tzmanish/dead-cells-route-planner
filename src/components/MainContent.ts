import { eventEmitter } from '../services/EventEmitterService';
import { viewService } from '../services/ViewService';
import { ControlPanel } from './ControlPanel'
import { loadingView } from './viewRenderers/LoadingView';

export function MainContent(): HTMLElement {
  const main = document.createElement('main')
  main.className = 'flex-1'

  main.appendChild(ControlPanel());

  let currentView = loadingView.render();
  main.appendChild(currentView);

  eventEmitter.on('view-update', () => {
    let newView = viewService.getView();
    main.replaceChild(newView, currentView);
    currentView = newView;
  });
  
  eventEmitter.emit('view-update');
  return main
}
