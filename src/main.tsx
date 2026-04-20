import { registerSW } from 'virtual:pwa-register';
import { render } from 'preact';

import App from './App';
import './styles.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element #root was not found');
}

render(<App />, rootElement);

registerSW({ immediate: true });
