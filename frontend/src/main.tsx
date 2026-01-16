import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('main.tsx: Starting mount');

try {
  const root = document.getElementById('root');
  console.log('main.tsx: Root element:', root);
  if (root) {
    ReactDOM.createRoot(root).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    )
    console.log('main.tsx: Render called');
  } else {
    console.error('main.tsx: Root element not found!');
  }
} catch (error) {
  console.error('main.tsx: Error mounting app:', error);
}
