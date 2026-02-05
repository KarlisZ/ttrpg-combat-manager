import { describe, it, expect } from 'vitest';
import { Combatant } from './Combatant';

describe('Combatant Model', () => {
    it('should calculate active statuses correctly', () => {
        const combatant = new Combatant({
            id: 'test',
            statuses: [
                { id: '1', name: 'Active', duration: 2, sourceRound: 1, icon: 'sparkles' },
                { id: '2', name: 'Expired', duration: 1, sourceRound: 1, icon: 'clock' },
                { id: '3', name: 'Future', duration: 2, sourceRound: 3, icon: 'bolt' }
            ]
        });

        const activeRound1 = combatant.getActiveStatuses(1);
        expect(activeRound1).toHaveLength(2); // Active, Expired (since 1 < 1+1 ? wait: sourceRound=1, duration=1. 1 < 2. Yes. Wait, store logic: store.currentRound < s.sourceRound + s.duration)
        // 1 < 1 + 1 is 1 < 2 (True).
        // sourceRound=1. 1 >= 1 (True).
        // So Expired is active in round 1.
        expect(activeRound1.map(s => s.name)).toContain('Active');
        expect(activeRound1.map(s => s.name)).toContain('Expired');
        expect(activeRound1.map(s => s.name)).not.toContain('Future');
        
        const activeRound2 = combatant.getActiveStatuses(2);
        // Active: 1+2 = 3. 2 < 3. Active.
        // Expired: 1+1 = 2. 2 < 2. False. Expired.
        // Future: 3. 2 < 3. 
        expect(activeRound2).toHaveLength(1);
        expect(activeRound2[0].name).toBe('Active');
        
        const activeRound3 = combatant.getActiveStatuses(3);
        // Active: 3 < 3 False.
        // Future: source 3. duration 2. 3 < 5. Active.
        expect(activeRound3).toHaveLength(1);
        expect(activeRound3[0].name).toBe('Future');
    });

    it('should calculate future statuses correctly', () => {
        const combatant = new Combatant({
             id: 'test',
             statuses: [
                { id: '1', name: 'Future', duration: 2, sourceRound: 3 }
            ]
        });

        expect(combatant.getFutureStatuses(1)).toHaveLength(1);
        expect(combatant.getFutureStatuses(2)).toHaveLength(1);
        expect(combatant.getFutureStatuses(3)).toHaveLength(0);
    });
});
