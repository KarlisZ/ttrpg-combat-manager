import { describe, it, expect, beforeEach, vi } from 'vitest';
import { runInAction } from 'mobx';
import { CombatStore } from './CombatStore';
import { Combatant } from './Combatant';
import { CombatantType, STORAGE_KEYS } from './constants';
import { MemoryStorageService } from '../services/StorageService';
import { HistoryManager } from '../services/HistoryManager';

describe('CombatStore', () => {
  let store: CombatStore;
  let storage: MemoryStorageService;
  let history: HistoryManager<string>;

  function createCombatant(id: string, name: string, initMod: number): Combatant {
    return new Combatant({
      id,
      name,
      type: CombatantType.HERO,
      initiative: 0,
      initiativeTieBreaker: 0,
      initiativeModifier: initMod,
      startingHp: 10,
      maxHp: 10,
      hpLog: {},
      statuses: [],
    });
  }

  beforeEach(() => {
    storage = new MemoryStorageService();
    history = new HistoryManager<string>();
    store = new CombatStore(storage, history);
  });

  it('should initialize with default values', () => {
    expect(store.currentRound).toBe(1);
    expect(store.activeCombatantId).toBe('');
    expect(store.combatants).toHaveLength(0);
  });

  it('should add combatant', () => {
    store.addCombatant(createCombatant('1', 'Hero 1', 2));
    expect(store.combatants).toHaveLength(1);
    expect(store.combatants[0].name).toBe('Hero 1');
  });

  it('should roll initiative and sort', () => {
    store.addCombatant(createCombatant('1', 'A', 0));
    store.addCombatant(createCombatant('2', 'B', 0));
    
    const ids = ['1', '2'];
    store.rollInitiative(ids);
    
    expect(store.combatants.find(c => c.id === '1')?.initiative).toBeGreaterThan(0);
    expect(store.combatants.find(c => c.id === '2')?.initiative).toBeGreaterThan(0);
    
    // Sort check
    runInAction(() => {
      const c1 = store.combatants.find(c => c.id === '1')!;
      const c2 = store.combatants.find(c => c.id === '2')!;
      c1.initiative = 10;
      c1.initiativeTieBreaker = 0;
      c2.initiative = 20;
      c2.initiativeTieBreaker = 0;
    });
    // store.sortCombatants(); // Removed
    
    expect(store.turnOrder[0].id).toBe('2'); // 20 > 10

    // Tie breaker check
    runInAction(() => {
      const c1 = store.combatants.find(c => c.id === '1')!;
      const c2 = store.combatants.find(c => c.id === '2')!;
      c2.initiative = 20;
      c2.initiativeTieBreaker = 10; 
      c1.initiative = 20;
      c1.initiativeTieBreaker = 5; 
    });
    // store.sortCombatants(); // Removed

    // id 2 (tie breaker 10) > id 1 (tie breaker 5)
    expect(store.turnOrder[0].id).toBe('2');
  });

  it('should manage turns and rounds', () => {
    store.addCombatant(createCombatant('1', 'A', 0));
    store.addCombatant(createCombatant('2', 'B', 0));
    
    // Round 1, Not Started
    expect(store.currentRound).toBe(1);
    expect(store.activeCombatantId).toBe('');
    
    store.nextTurn(); // Start
    expect(store.activeCombatantId).toBe('1');
    expect(store.currentRound).toBe(1);
    
    store.nextTurn();
    expect(store.activeCombatantId).toBe('2');
    expect(store.currentRound).toBe(1);
    
    store.nextTurn();
    expect(store.activeCombatantId).toBe('1');
    expect(store.currentRound).toBe(2);
    
    store.previousTurn();
    expect(store.activeCombatantId).toBe('2');
    expect(store.currentRound).toBe(1);
  });

  it('should persist to storage service', () => {
    store.addCombatant(createCombatant('1', 'A', 0));
    
    // Check injected storage
    const json = storage.load(STORAGE_KEYS.COMBAT_STATE);
    expect(json).toBeTruthy();
    if (json) {
        expect(json).toContain('A');
    }
  });

  it('should support undo/redo', () => {
      store.addCombatant(createCombatant('1', 'A', 0));
      
      store.nextTurn(); // Activate A
      store.nextTurn();
      expect(store.currentRound).toBe(2);
      
      // Verify via public history state getters
      expect(store.historyState.length).toBeGreaterThan(1);
      expect(store.historyState.canUndo).toBe(true);

      store.undo();
      expect(store.currentRound).toBe(1);
      
      expect(store.historyState.canRedo).toBe(true);

      store.redo();
      expect(store.currentRound).toBe(2);
  });

  it('should reset for new combat', () => {
    // Add hero and monster
    const hero = createCombatant('h1', 'Hero', 0);
    hero.statuses.push({ id: 's1', name: 'Poisoned', duration: 3, sourceRound: 1 });
    store.addCombatant(hero);
    
    const monster = createCombatant('m1', 'Monster', 0);
    monster.type = CombatantType.MONSTER;
    store.addCombatant(monster);
    
    store.newCombat();
    
    expect(store.combatants).toHaveLength(1);
    expect(store.combatants[0].id).toBe('h1');
    expect(store.combatants[0].statuses).toHaveLength(0);
    expect(store.currentRound).toBe(1);
  });

  it('should modify HP with math expression', () => {
    const c = createCombatant('1', 'A', 0);
    // c.hp = 10; // Rely on startingHp=10
    store.addCombatant(c);
    
    store.modifyHp('1', '-5');
    expect(store.getHp('1')).toBe(5);
    expect(store.combatants[0].hpLog[1]).toBe('-5');
    
    store.modifyHp('1', '+2');
    expect(store.getHp('1')).toBe(7);
    expect(store.combatants[0].hpLog[1]).toBe('-5, +2');
  });

  it('should load state from storage on init', () => {
      const savedState = JSON.stringify({
          currentRound: 5,
          combatants: []
      });
      storage.save(STORAGE_KEYS.COMBAT_STATE, savedState);
      
      const newStore = new CombatStore(storage, new HistoryManager());
      expect(newStore.currentRound).toBe(5);
  });

  it('should handle partial state gracefully', () => {
       const savedState = JSON.stringify({});
      storage.save(STORAGE_KEYS.COMBAT_STATE, savedState);
      
      const newStore = new CombatStore(storage, new HistoryManager());
      expect(newStore.currentRound).toBe(1); // Default
      expect(newStore.combatants).toEqual([]);
  });

  it('should handle invalid state gracefully', () => {
      storage.save(STORAGE_KEYS.COMBAT_STATE, 'invalid json');
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const newStore = new CombatStore(storage, new HistoryManager());
      expect(newStore.currentRound).toBe(1);
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
  });

  it('should handle load error gracefully', () => {
      vi.spyOn(storage, 'load').mockImplementation(() => { throw new Error('Fail'); });
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const newStore = new CombatStore(storage, new HistoryManager());
      expect(newStore.currentRound).toBe(1);
      expect(spy).toHaveBeenCalled();
       
      spy.mockRestore();
  });

  it('should ignore modifyHp for invalid id', () => {
    store.modifyHp('invalid', '-5');
  });

  it('should ignore rollInitiative for invalid id', () => {
    store.rollInitiative(['invalid']);
  });

  it('should ignore turn changes when no combatants', () => {
      store.nextTurn();
      expect(store.activeCombatantId).toBe('');
      store.previousTurn();
      expect(store.activeCombatantId).toBe('');
  });

  it('should not regress before round 1', () => {
    store.addCombatant(createCombatant('1', 'A', 0));
    // Round 1, Active Null
    store.previousTurn();
    expect(store.currentRound).toBe(1);
    // Should behave sensibly, likely active becomes A or null depending on implementation
  });

  it('should not push initial state if history is not empty', () => {
    const history = new HistoryManager<string>();
    history.push('existing');
    new CombatStore(storage, history);
    expect(history.historyLength).toBe(1); 
    expect(history.snapshot).toEqual(['existing']);
  });

  it('should ignore undo if history returns null', () => {
    const history = new HistoryManager<string>();
    history.push('1');
    history.push('2');
    vi.spyOn(history, 'undo').mockReturnValue(null);
    vi.spyOn(history, 'canUndo', 'get').mockReturnValue(true);

    const newStore = new CombatStore(storage, history);
    
    const saveSpy = vi.spyOn(storage, 'save');
    newStore.undo();
    
    expect(saveSpy).not.toHaveBeenCalled(); 
  });

  it('should handle tied combatants logic', () => {
    store.addCombatant(createCombatant('1', 'A', 0));
    store.addCombatant(createCombatant('2', 'B', 0));
    
    runInAction(() => {
        const c1 = store.combatants.find(c => c.id === '1')!;
        const c2 = store.combatants.find(c => c.id === '2')!;
        c1.initiative = 20;
        c1.initiativeTieBreaker = 0;
        c2.initiative = 20;
        c2.initiativeTieBreaker = 0;
    });

    const ties = store.tiedCombatantGroups;
    expect(ties.length).toBe(1);
    expect(ties[0].length).toBe(2);
    expect(store.tiedCombatantIds.has('1')).toBe(true);
    
    store.assignTieBreaker('1');
    expect(store.combatants[0].id).toBe('1'); 
  });

  it('should auto resolve ties', () => {
     store.addCombatant(createCombatant('1', 'A', 0));
     store.addCombatant(createCombatant('2', 'B', 0));
     store.addCombatant(createCombatant('3', 'C', 0));

     runInAction(() => {
        store.combatants.forEach(c => {
            c.initiative = 20;
            c.initiativeTieBreaker = 0;
        });
     });
     
     expect(store.tiedCombatantGroups.length).toBe(1);

     store.autoResolveTies();
     
     expect(store.tiedCombatantGroups.length).toBe(0);
     
     // Verify "Data Entry Order": 1 was added first, so should be first in turnOrder
     const order = store.turnOrder;
     expect(order[0].id).toBe('1');
     expect(order[1].id).toBe('2');
     expect(order[2].id).toBe('3');
  });

  it('should add and remove statuses', () => {
      const c = createCombatant('1', 'A', 0);
      store.addCombatant(c);
      
      store.addStatus('1', { name: 'Dazed', duration: 2 });
      
      const storedC = store.combatants.find(x => x.id === '1')!;
      expect(storedC.statuses).toHaveLength(1);
      expect(storedC.statuses[0].name).toBe('Dazed');
      expect(storedC.statuses[0].sourceRound).toBe(1);
      
      const statusId = storedC.statuses[0].id;
      store.removeStatus('1', statusId);
      expect(storedC.statuses).toHaveLength(0);
  });

  it('should not break if adding status to missing combatant', () => {
      expect(() => store.addStatus('999', { name: 'Burn', duration: 1})).not.toThrow();
  });
  
  it('should not break if removing status from missing combatant', () => {
      expect(() => store.removeStatus('999', '123')).not.toThrow();
  });

  it('should export and import state', () => {
      const c = createCombatant('1', 'Hero', 0);
      store.addCombatant(c);
      runInAction(() => {
        store.currentRound = 3;
      });
      
      const json = store.exportState();
      
      const newStore = new CombatStore(new MemoryStorageService(), new HistoryManager());
      newStore.importState(json);
      
      expect(newStore.combatants).toHaveLength(1);
      expect(newStore.combatants[0].name).toBe('Hero');
      expect(newStore.currentRound).toBe(3);
  });
  
  it('should handle invalid JSON import', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => store.importState('{ invalid json')).toThrow();
      spy.mockRestore();
  });

  it('should throw error on schema mismatch import', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => store.importState(JSON.stringify({}))).toThrow("Invalid JSON file");
      spy.mockRestore();
  });

    it('should update HP log history correctly', () => {
        const c = createCombatant('1', 'Hero', 0);
        // c.hp = 10;
        store.addCombatant(c);
        
        store.updateHpLog('1', 1, '-5');
        
        const storedC = store.combatants.find(x => x.id === '1')!;
        expect(store.getHp('1')).toBe(5);
        expect(storedC.hpLog[1]).toBe('-5');
        
        store.updateHpLog('1', 1, '-2'); 
        expect(store.getHp('1')).toBe(8);
        expect(storedC.hpLog[1]).toBe('-2');
    });

    it('should fallback HP log history to 0 if invalid', () => {
         const c = createCombatant('1', 'Hero', 0);
         // c.hp = 10;
         store.addCombatant(c);
         
         store.updateHpLog('1', 1, 'invalid');
         
         expect(store.getHp('1')).toBe(10); 
    });

    it('should handle ignore updateHpLog for invalid id', () => {
        expect(() => store.updateHpLog('999', 1, '-5')).not.toThrow();
    });

    it('should roll initiative with auto-resolve ties', () => {
        runInAction(() => {
            store.autoResolveTiesEnabled = true;
        });
        const c1 = createCombatant('1', 'A', 0);
        const c2 = createCombatant('2', 'B', 0);
        store.addCombatant(c1);
        store.addCombatant(c2);
        
        store.rollInitiative(['1', '2']);
        // Can't easily deterministic test random assignment, but we can ensure no crash
        // and that sort happened
        expect(store.combatants.length).toBe(2);
    });

    it('should get active combatant safely', () => {
        expect(store.activeCombatant).toBeUndefined();
        
        store.addCombatant(createCombatant('1', 'A', 0));
        store.nextTurn();
        expect(store.activeCombatant).toBeDefined();
    });

  describe('Spawning', () => {
      it('should spawn hero', () => {
          store.spawnHero('Hero X', 15);
          expect(store.combatants).toHaveLength(1);
          const hero = store.combatants[0];
          expect(hero.type).toBe(CombatantType.HERO);
          expect(hero.name).toBe('Hero X');
          expect(hero.initiative).toBe(15);
      });

      it('should spawn monster with auto-rolled initiative', () => {
          runInAction(() => {
            store.initiativeDice = 20;
          });
          store.spawnMonster('Goblin', 7, 2, 1);
          expect(store.combatants).toHaveLength(1);
          const monster = store.combatants[0];
          expect(monster.type).toBe(CombatantType.MONSTER);
          expect(monster.name).toBe('Goblin');
          expect(monster.initiative).toBeGreaterThanOrEqual(1 + 2);
          expect(monster.initiative).toBeLessThanOrEqual(20 + 2);
      });

      it('should spawn multiple monsters', () => {
          store.spawnMonster('Orc', 15, 0, 3);
          expect(store.combatants).toHaveLength(3);
          expect(store.combatants[0].name).toMatch(/Orc \d/);
          expect(store.combatants[1].name).toMatch(/Orc \d/);
          expect(store.combatants[2].name).toMatch(/Orc \d/);
      });
  });

  it('should expose direct history getters', () => {
      expect(store.canUndo).toBe(false);
      expect(store.canRedo).toBe(false);
      
      store.addCombatant(createCombatant('1', 'A', 0));
      store.nextTurn();
      
      expect(store.canUndo).toBe(true);
  });

  it('should update combatant', () => {
      store.addCombatant(createCombatant('1', 'A', 0));
      store.updateCombatant('1', { name: 'Updated' });
      expect(store.combatants[0].name).toBe('Updated');
      
      // Update non-existent
      store.updateCombatant('999', { name: 'Nope' });
      expect(store.combatants).toHaveLength(1);
  });

  it('should handle state with activeCombatantId', () => {
    const stateObj = {
        combatants: [{
            id: 'c1',
            name: 'C1',
            type: CombatantType.HERO,
            initiative: 10,
            initiativeTieBreaker: 0,
            initiativeModifier: 0,
            startingHp: 10,
            maxHp: 10, 
            hpLog: {},
            statuses: []
        }],
        currentRound: 1,
        activeCombatantId: 'c1'
    };
    
    storage.save(STORAGE_KEYS.COMBAT_STATE, JSON.stringify(stateObj));
    
    const newStore = new CombatStore(storage, new HistoryManager());
    expect(newStore.activeCombatantId).toBe('c1');
 });

 it('should handle state with neither activeCombatantId', () => {
    const stateObj = {
        combatants: [{
             id: 'c1',
             name: 'C1',
             type: CombatantType.HERO,
             initiative: 10,
             initiativeTieBreaker: 0,
             initiativeModifier: 0,
             startingHp: 10,
             maxHp: 10, 
             hpLog: {},
             statuses: []
        }],
        currentRound: 1
    };
    
    storage.save(STORAGE_KEYS.COMBAT_STATE, JSON.stringify(stateObj));
    
    const newStore = new CombatStore(storage, new HistoryManager());
    expect(newStore.activeCombatantId).toBe('');
 });
 
 it('should remove combatant', () => {
     store.addCombatant(createCombatant('1', 'A', 0));
     store.removeCombatant('1');
     expect(store.combatants).toHaveLength(0);
 });
 it('should not go before first turn of first round', () => {
    store.addCombatant(createCombatant('1', 'A', 0));
    store.addCombatant(createCombatant('2', 'B', 0));
    
    store.nextTurn(); // Active 1, Round 1
    
    store.previousTurn();
    expect(store.currentRound).toBe(1);
    expect(store.activeCombatantId).toBe('1');
 });
});