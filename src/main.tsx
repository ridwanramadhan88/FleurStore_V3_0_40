import { createRoot } from 'react-dom/client'
import './shadcn.css'
import App from './App'
import { initializeOperationalPersistence } from './store/operationalPersistence'
import { UiLanguageBridge } from './i18n/UiLanguageBridge'

const documentRoot = window.document.documentElement
documentRoot.classList.remove('dark')
documentRoot.style.colorScheme = 'light'
window.localStorage.removeItem('fleurstales:theme')

const root = createRoot(document.getElementById('app')!)

const start = async () => {
  // Hydrate linked operational stores before mounting components so the first
  // render never mixes persisted orders with reset branches/employees/catalog.
  await initializeOperationalPersistence()
  root.render(<>
    <UiLanguageBridge />
    <App />
  </>)
}

void start()
