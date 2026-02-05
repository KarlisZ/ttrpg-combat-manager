import { describe, it, expect, beforeEach } from 'vitest';
import { runInAction } from 'mobx';
import { CombatStore } from './CombatStore';
import { UIStore } from './UIStore';
import { MemoryStorageService } from '../services/StorageService';
import { HistoryManager } from '../services/HistoryManager';
import { Combatant } from './Combatant';
import { CombatantType } from './constants';

const createCombatant = (id: string, name: string, initiative: number) => 
    new Combatant({ id, name, initiative, type: CombatantType.MONSTER, maxHp: 10 });

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

    it('should toggle order sort', () => {
        // Initially default sort (null, desc)
        expect(uiStore.sortKey).toBeNull();
        expect(uiStore.sortDir).toBe('desc');

        // Toggle order sort
        uiStore.toggleOrderSort();
        expect(uiStore.sortKey).toBeNull();
        expect(uiStore.sortDir).toBe('asc'); // toggled

        uiStore.toggleOrderSort();
        expect(uiStore.sortDir).toBe('desc'); // toggled back

        // Set to something else first
        uiStore.setSort('name');
        expect(uiStore.sortKey).toBe('name');

        // Toggle order sort should reset to null
        uiStore.toggleOrderSort();
        expect(uiStore.sortKey).toBeNull();
        expect(uiStore.sortDir).toBe('desc');
    });
    
    it('should sort by number and string correctly', () => {
         const c1 = createCombatant('1', 'A', 10);
         c1.maxHp = 20;
         const c2 = createCombatant('2', 'B', 15);
         c2.maxHp = 10;
         
         combatStore.addCombatant(c1);
         combatStore.addCombatant(c2);
         
         // Sort by MaxHP (Number)
         uiStore.setSort('maxHp');
         uiStore.sortDir = 'asc'; // 10, 20
         expect(uiStore.sortedCombatants[0].maxHp).toBe(10);
         expect(uiStore.sortedCombatants[1].maxHp).toBe(20);
         
         // Sort by Name (String)
         uiStore.setSort('name');
         uiStore.sortDir = 'desc'; // B, A
         expect(uiStore.sortedCombatants[0].name).toBe('B');
         expect(uiStore.sortedCombatants[1].name).toBe('A');
    });

    it('should reverse default order when ASC', () => {
         const c1 = createCombatant('1', 'A', 10);
         const c2 = createCombatant('2', 'B', 20);
         combatStore.addCombatant(c1);
         combatStore.addCombatant(c2);
         // Default order: Descending Initiative -> B (20), A (10)
         
         uiStore.sortKey = null;
         uiStore.sortDir = 'asc'; // Should reverse default -> A, B
         
         expect(uiStore.sortedCombatants[0].id).toBe('1');
         expect(uiStore.sortedCombatants[1].id).toBe('2');
    });

    it('should set announcement', () => {
        uiStore.setAnnouncement('Test');
        expect(uiStore.announcement).toBe('Test');
    });

    it('should return sorted combatants', () => {
        const c1 = new Combatant({ id: '1', name: 'A', type: CombatantType.HERO, initiative: 10, initiativeTieBreaker: 0, initiativeModifier: 0, maxHp: 10, hpLog: {}, statuses: [] });
        const c2 = new Combatant({ id: '2', name: 'B', type: CombatantType.HERO, initiative: 5, initiativeTieBreaker: 0, initiativeModifier: 0, maxHp: 10, hpLog: {}, statuses: [] });
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

        // Sort equals
        const c3 = new Combatant({ id: '3', name: 'A', type: CombatantType.HERO, initiative: 0, initiativeTieBreaker: 0, initiativeModifier: 0, maxHp: 10, hpLog: {}, statuses: [] });
        combatStore.addCombatant(c3);
        // Sort by Name Asc
        uiStore.setSort('name'); 
        // Was DESC, now ASC
        
        // A and A are equal. Stable sort or order preservation?
        // JS sort is stable. '1' was added first (A), '3' added second (A).
        // So 1 then 3.
        const sorted = uiStore.sortedCombatants;
        expect(sorted[0].name).toBe('A');
        expect(sorted[1].name).toBe('A');
    });



    it('should provide correct row state', () => {
        const c1 = new Combatant({ id: '1', name: 'A', type: CombatantType.HERO, initiative: 10, initiativeTieBreaker: 0, initiativeModifier: 0, maxHp: 10, hpLog: {}, statuses: [] });
        combatStore.addCombatant(c1);
        
        // Active
        runInAction(() => {
            combatStore.activeCombatantId = '1';
        });
        let state = uiStore.getRowState('1');
        expect(state.isActive).toBe(true);
        
        // Inactive
        const c2 = new Combatant({ id: '2', name: 'B', type: CombatantType.HERO, initiative: 5, initiativeTieBreaker: 0, initiativeModifier: 0, maxHp: 10, hpLog: {}, statuses: [] });
        combatStore.addCombatant(c2);

        runInAction(() => {
            combatStore.activeCombatantId = '2';
        });
        state = uiStore.getRowState('1');
        expect(state.isActive).toBe(false); 
    });

    it('should set hovered status name', () => {
        expect(uiStore.hoveredStatusName).toBeNull();
        uiStore.setHoveredStatusName('Poisoned');
        expect(uiStore.hoveredStatusName).toBe('Poisoned');
        uiStore.setHoveredStatusName(null);
        expect(uiStore.hoveredStatusName).toBeNull();
    });

    it('should not sort (or maintain stable order) when sorting by complex types', () => {
         const c1 = createCombatant('1', 'A', 10); 
         const c2 = createCombatant('2', 'B', 10);
         combatStore.addCombatant(c1);
         combatStore.addCombatant(c2);
         
         // Sort by statuses (Array) -> should fall through and return 0 (stable)
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         uiStore.setSort('statuses' as any); 
         
         expect(uiStore.sortedCombatants.length).toBe(2);
    });
});

