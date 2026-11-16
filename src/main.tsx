import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './i18n'
import './index.css'
import { APP_VERSION } from './lib/changelog'
import { startVersionTracking } from './lib/storage'
import { initUpdates } from './lib/update'
import { AppProvider } from './state.tsx'

startVersionTracking(APP_VERSION)
initUpdates()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </StrictMode>,
)
