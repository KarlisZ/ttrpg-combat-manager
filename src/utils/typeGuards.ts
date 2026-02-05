import type { AppState } from '../models/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isAppState(data: any): data is AppState {
    if (typeof data !== 'object' || data === null) return false;
    
    if (!Array.isArray(data.combatants)) return false;
    if (typeof data.currentRound !== 'number') return false;

    if (data.maxRound !== undefined && typeof data.maxRound !== 'number') return false;
    
    // Check optional/nullable fields if present match type
    if (data.activeCombatantId !== undefined && data.activeCombatantId !== null && typeof data.activeCombatantId !== 'string') return false;
    if (data.initiativeDice !== undefined && typeof data.initiativeDice !== 'number') return false;
    if (data.tieBreakerMode !== undefined && typeof data.tieBreakerMode !== 'boolean') return false;
    if (data.autoResolveTiesEnabled !== undefined && typeof data.autoResolveTiesEnabled !== 'boolean') return false;

    return true;
}
