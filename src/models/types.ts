
import type { IconName } from '../utils/icons';
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
  sourceId?: string;
  icon: IconName;
  description?: string;
}

export enum TieBreakerRule {
  MODIFIER = 'modifier',
  NAME = 'name',
}

export interface AppState {
  combatants: Partial<Combatant>[];
  currentRound: number;
  maxRound?: number;
  activeCombatantId?: string | null;
  initiativeDice: number;

  tieBreakerRule: TieBreakerRule;
}
