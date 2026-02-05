import { describe, it, expect, beforeEach } from 'vitest';
import { CombatStore } from './CombatStore';
import { Combatant } from './Combatant';
import { CombatantType } from './constants';
import { MemoryStorageService } from '../services/StorageService';
import { HistoryManager } from '../services/HistoryManager';
import { runInAction } from 'mobx';

describe('CombatStore Status Logic', () => {
    let store: CombatStore;
    let storage: MemoryStorageService;
    let history: HistoryManager<string>;

    beforeEach(() => {
        storage = new MemoryStorageService();
        history = new HistoryManager<string>();
        store = new CombatStore(storage, history);
    });

    it('should remove expired statuses on nextTurn', () => {
        const c1 = new Combatant({
            id: 'c1',
            name: 'Hero',
            type: CombatantType.HERO,
            initiative: 20,
            statuses: []
        });
        store.addCombatant(c1);
        
        // Active is c1. Round 1.
        expect(store.currentRound).toBe(1);
        expect(store.activeCombatantId).toBe('c1');

        runInAction(() => {
            store.addStatus('c1', { name: 'Short', duration: 1, icon: 'sparkles' });
            store.addStatus('c1', { name: 'Long', duration: 2, icon: 'shield' });
        });

        const statusShort = c1.statuses.find(s => s.name === 'Short');
        const statusLong = c1.statuses.find(s => s.name === 'Long');

        expect(statusShort).toBeDefined();
        expect(statusLong).toBeDefined();

        // Advance turn. Since only 1 combatant, it wraps to Round 2.
        store.nextTurn();

        expect(store.currentRound).toBe(2);
        
        // Short expired? 
        // Round 2. sourceRound 1. duration 1. elapsed (2-1)=1. 1 < 1 is False. 
        // It SHOULD be removed.
        expect(c1.statuses.find(s => s.id === statusShort?.id)).toBeUndefined();
        
        // Long expired?
        // Round 2. sourceRound 1. duration 2. elapsed 1. 1 < 2 is True.
        // It SHOULD remain.
        expect(c1.statuses.find(s => s.id === statusLong?.id)).toBeDefined();

        // Advance to Round 3
        store.nextTurn();
        expect(store.currentRound).toBe(3);
        
        // Long expired?
        // Round 3. sourceRound 1. duration 2. elapsed 2. 2 < 2 is False.
        // It SHOULD be removed.
        expect(c1.statuses.find(s => s.id === statusLong?.id)).toBeUndefined();
    });
});
