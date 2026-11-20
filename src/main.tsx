import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import App from './App.tsx'
import '@fontsource-variable/inter/wght.css'
import '@fontsource-variable/space-grotesk/wght.css'
import '@fontsource-variable/source-serif-4/wght.css'
import '@fontsource-variable/source-serif-4/wght-italic.css'
import './i18n'
import './index.css'
import { privatePath } from './lib/analytics'
import { APP_VERSION } from './lib/changelog'
import { startVersionTracking } from './lib/storage'
import { initInstall } from './lib/install'
import { initUpdates } from './lib/update'
import { AppProvider } from './state.tsx'

startVersionTracking(APP_VERSION)
initUpdates()
initInstall()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
    <Analytics beforeSend={privatePath} />
  </StrictMode>,
)
