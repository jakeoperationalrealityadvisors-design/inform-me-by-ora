import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)

// Register service worker for offline / PWA support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('[SW] Registered:', registration.scope);

        // Listen for the SW telling us to trigger a sync
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data?.type === 'TRIGGER_SYNC') {
            window.dispatchEvent(new CustomEvent('sw-trigger-sync'));
          }
        });

        // Register background sync tag when coming online
        window.addEventListener('online', () => {
          if (registration.sync) {
            registration.sync.register('sync-submissions').catch(() => {});
          }
        });
      })
      .catch((err) => console.warn('[SW] Registration failed:', err));
  });
}