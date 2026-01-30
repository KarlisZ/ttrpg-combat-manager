
import type { Combatant } from './Combatant';

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

export interface Status {
  id: string;
  name: string;
  duration: number;
  sourceRound: number;
}

export interface AppState {
  combatants: Partial<Combatant>[];
  currentRound: number;
  activeCombatantId?: string | null;
  initiativeDice: number;
  tieBreakerMode: boolean;
  autoResolveTiesEnabled: boolean;
}
