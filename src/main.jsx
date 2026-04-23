import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import InstallBanner from './components/InstallBanner.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <InstallBanner />
  </StrictMode>,
)

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .getRegistrations()
    .then(registrations => {
      registrations.forEach(r => r.unregister())
    })
}
