import { describe, it, expect } from 'vitest';
import { isAppState } from './typeGuards';

describe('typeGuards', () => {
    describe('isAppState', () => {
        it('should return true for valid state', () => {
            const valid = {
                combatants: [],
                currentRound: 1,
                activeCombatantId: '1',
                initiativeDice: 20,
                tieBreakerMode: false,
                autoResolveTiesEnabled: true
            };
            expect(isAppState(valid)).toBe(true);
        });

        it('should return true for minimal valid state', () => {
             const valid = {
                combatants: [],
                currentRound: 1
            };
            expect(isAppState(valid)).toBe(true);
        });

        it('should return false for non-object', () => {
             expect(isAppState(null)).toBe(false);
             expect(isAppState(1)).toBe(false);
             expect(isAppState('s')).toBe(false);
        });

        it('should return false if combatants is not array', () => {
            expect(isAppState({ combatants: {}, currentRound: 1})).toBe(false);
        });

        it('should return false if currentRound is missing/wrong', () => {
            expect(isAppState({ combatants: [] })).toBe(false);
            expect(isAppState({ combatants: [], currentRound: '1' })).toBe(false);
        });

        it('should check optional fields types', () => {
            const base = { combatants: [], currentRound: 1 };
            expect(isAppState({ ...base, activeCombatantId: 1 })).toBe(false);
            expect(isAppState({ ...base, initiativeDice: '20' })).toBe(false);
            expect(isAppState({ ...base, tieBreakerMode: 'true' })).toBe(false);
            expect(isAppState({ ...base, autoResolveTiesEnabled: 1 })).toBe(false);
        });

        it('should return false if maxRound is invalid', () => {
             const invalid = {
                combatants: [],
                currentRound: 1,
                maxRound: "not-a-number"
            };
            expect(isAppState(invalid)).toBe(false);
        });
    });
});
