
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CombatStore } from './CombatStore';
import { CombatantType } from './constants';
import { IStorageService } from '../services/StorageService';
import { IHistoryManager } from '../services/HistoryManager';
import { Combatant } from './Combatant';

describe('CombatStore - Spawn Turn Logic', () => {
  let store: CombatStore;
  let mockStorage: IStorageService;
  let mockHistory: IHistoryManager<string>;

  beforeEach(() => {
    mockStorage = { 
        save: vi.fn(), 
        load: vi.fn().mockReturnValue(null),
        remove: vi.fn(),
        clear: vi.fn()
    };
    mockHistory = { 
        push: vi.fn(), 
        undo: vi.fn(), 
        redo: vi.fn(), 
        historyLength: 0, 
        canUndo: false, 
        canRedo: false,
        currentIndex: 0,
        snapshot: []
    };
    store = new CombatStore(mockStorage, mockHistory);
  });

  it('preserves the turn index when a higher initiative combatant is added (Turn 1)', () => {
    // Setup: Hero A (20). Active.
    const heroA = new Combatant({
        id: 'hero-a',
        name: 'Hero A',
        type: CombatantType.HERO,
        initiative: 20,
        initiativeModifier: 0,
        maxHp: 10,
        hpLog: {},
        statuses: []
    });
    store.addCombatant(heroA);
    // store.activeCombatantId = heroA.id; // Removed manual assignment
    
    expect(store.turnOrder[0].id).toBe(heroA.id);
    expect(store.activeCombatantId).toBe(heroA.id);

    // Act: Add Monster C (30).
    const monsterC = new Combatant({
        id: 'monster-c',
        name: 'Monster C',
        type: CombatantType.MONSTER,
        initiative: 30, // Higher than 20
        initiativeModifier: 0,
        maxHp: 10,
        hpLog: {},
        statuses: []
    });
    store.addCombatant(monsterC);
    
    // Assert: Turn Order should be C, A.
    expect(store.turnOrder[0].id).toBe(monsterC.id);
    expect(store.turnOrder[1].id).toBe(heroA.id);

    // Check desired behavior: Active ID should switch to C (Index 0)
    expect(store.activeCombatantId).toBe(monsterC.id);
  });
});
