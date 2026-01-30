import { createContext, useContext } from 'react';
import type { CombatStore } from '../models/CombatStore';
import type { UIStore } from '../models/UIStore';

export interface RootStore {
  combatStore: CombatStore;
  uiStore: UIStore;
}

const StoreContext = createContext<RootStore | null>(null);

export const StoreProvider = StoreContext.Provider;

export const useStore = () => {
  const store = useContext(StoreContext);
  if (!store) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return store;
};
