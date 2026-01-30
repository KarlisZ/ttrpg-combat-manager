import { describe, it, expect, beforeEach } from 'vitest';
import { runInAction } from 'mobx';
import { CombatStore } from './CombatStore';
import { UIStore } from './UIStore';
import { MemoryStorageService } from '../services/StorageService';
import { HistoryManager } from '../services/HistoryManager';
import { Combatant } from './Combatant';
import { CombatantType } from './constants';

describe('UIStore', () => {
    let combatStore: CombatStore;
    let uiStore: UIStore;

    beforeEach(() => {
        const storage = new MemoryStorageService();
        const history = new HistoryManager<string>();
        combatStore = new CombatStore(storage, history);
        uiStore = new UIStore(combatStore);
    });

    it('should initialize with defaults', () => {
        expect(uiStore.sortKey).toBeNull();
        expect(uiStore.sortDir).toBe('desc');
        expect(uiStore.announcement).toBe('');
    });

    it('should set sort key and toggle direction', () => {
        uiStore.setSort('name');
        expect(uiStore.sortKey).toBe('name');
        expect(uiStore.sortDir).toBe('desc');

        uiStore.setSort('name');
        expect(uiStore.sortDir).toBe('asc');
        
        uiStore.setSort('initiative');
        expect(uiStore.sortKey).toBe('initiative');
        expect(uiStore.sortDir).toBe('desc');
    });

    it('should set announcement', () => {
        uiStore.setAnnouncement('Test');
        expect(uiStore.announcement).toBe('Test');
    });

    it('should return sorted combatants', () => {
        const c1 = new Combatant({ id: '1', name: 'A', type: CombatantType.HERO, initiative: 10, initiativeTieBreaker: 0, initiativeModifier: 0, startingHp: 10, maxHp: 10, hpLog: {}, statuses: [] });
        const c2 = new Combatant({ id: '2', name: 'B', type: CombatantType.HERO, initiative: 5, initiativeTieBreaker: 0, initiativeModifier: 0, startingHp: 10, maxHp: 10, hpLog: {}, statuses: [] });
        combatStore.addCombatant(c1);
        combatStore.addCombatant(c2);

        // Default: uses turnOrder (init desc)
        expect(uiStore.sortedCombatants[0].id).toBe('1');

        // Sort by initiative asc
        uiStore.setSort('initiative');
        uiStore.setSort('initiative');
        expect(uiStore.sortedCombatants[0].id).toBe('2');

        // Sort by name desc
        uiStore.setSort('name');
        expect(uiStore.sortedCombatants[0].id).toBe('2'); // B > A
    });



    it('should provide correct row state', () => {
        const c1 = new Combatant({ id: '1', name: 'A', type: CombatantType.HERO, initiative: 10, initiativeTieBreaker: 0, initiativeModifier: 0, startingHp: 10, maxHp: 10, hpLog: {}, statuses: [] });
        combatStore.addCombatant(c1);
        
        // Active
        runInAction(() => {
            combatStore.activeCombatantId = '1';
        });
        let state = uiStore.getRowState('1');
        expect(state.isActive).toBe(true);
        expect(state.isTieBreakerMode).toBe(false);

        // Tie Breaker Mode
        runInAction(() => {
            combatStore.tieBreakerMode = true;
        });
        state = uiStore.getRowState('1');
        expect(state.isActive).toBe(false); 
        expect(state.isTieBreakerMode).toBe(true);
        expect(state.isTied).toBe(false); 

        // Tied
        const c2 = new Combatant({ id: '2', name: 'A', type: CombatantType.HERO, initiative: 10, initiativeTieBreaker: 0, initiativeModifier: 0, startingHp: 10, maxHp: 10, hpLog: {}, statuses: [] });
        combatStore.addCombatant(c2);
        // c1 and c2 have same init (10). But tie breaker is 0.
        // CombatStore logic checks if uniqueScores.size < group.length.
        // Both have 0. group length 2. unique size 1. So tied.
        
        state = uiStore.getRowState('1');
        expect(state.isTied).toBe(true);
    });
});
