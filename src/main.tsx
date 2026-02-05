import { observer } from 'mobx-react-lite'
import { createRoot } from 'react-dom/client'
import { CombatTable } from './components/CombatTable'
import { CommandBar } from './components/CommandBar'
import { Footer } from './components/Footer'
import { Layout } from './components/Layout'
import { SpawnControls } from './components/SpawnControls'
import { LocaleProvider } from './contexts/LocaleContext'
import { StoreProvider } from './contexts/StoreContext'
import { CombatStore } from './models/CombatStore'
import { DEFAULTS } from './models/constants'
import { UIStore } from './models/UIStore'
import { HistoryManager } from './services/HistoryManager'
import { LocalStorageService } from './services/StorageService'
import './style.css'

// Instantiate the store at the root level (No Singletons pattern compliance)
const storageService = new LocalStorageService();
const historyManager = new HistoryManager<string>(DEFAULTS.MAX_HISTORY_SIZE);
const combatStore = new CombatStore(storageService, historyManager);
const uiStore = new UIStore(combatStore);
const rootStore = { combatStore, uiStore };

const App = observer(() => {
  return (
    <LocaleProvider>
        <StoreProvider value={rootStore}>
        <Layout
            header={<CommandBar />}
            controls={<SpawnControls />}
            footer={<Footer />}
        >
            <CombatTable />
        </Layout>
        </StoreProvider>
    </LocaleProvider>
  )
})

const container = document.getElementById('root')
if (container) {
  const root = createRoot(container)
  root.render(<App />)
}
