import type { IconName } from '../utils/icons';

export enum CombatantType {
  HERO = 'Hero',
  MONSTER = 'Monster',
}

export const DEFAULTS = {
  INITIATIVE_DICE: 20,
  MAX_HISTORY_SIZE: 100,
  STARTING_ROUND: 1,
  STARTING_TURN_INDEX: 0,
} as const;

export enum Condition {
  BLINDED = 'Blinded',
  CHARMED = 'Charmed',
  DEAFENED = 'Deafened',
  FRIGHTENED = 'Frightened',
  GRAPPLED = 'Grappled',
  INCAPACITATED = 'Incapacitated',
  INVISIBLE = 'Invisible',
  PARALYZED = 'Paralyzed',
  PETRIFIED = 'Petrified',
  POISONED = 'Poisoned',
  PRONE = 'Prone',
  RESTRAINED = 'Restrained',
  STUNNED = 'Stunned',
  UNCONSCIOUS = 'Unconscious',
  EXHAUSTION = 'Exhaustion',
}

export interface ConditionDefinition {
  id: string;
  name: string;
  defaultIcon: IconName;
}

export const CONDITIONS: ConditionDefinition[] = [
  { id: Condition.BLINDED, name: Condition.BLINDED, defaultIcon: 'eyeSlash' },
  { id: Condition.CHARMED, name: Condition.CHARMED, defaultIcon: 'heart' },
  { id: Condition.DEAFENED, name: Condition.DEAFENED, defaultIcon: 'speakerXMark' },
  { id: Condition.FRIGHTENED, name: Condition.FRIGHTENED, defaultIcon: 'exclamationTriangle' },
  { id: Condition.GRAPPLED, name: Condition.GRAPPLED, defaultIcon: 'handRaised' },
  { id: Condition.INCAPACITATED, name: Condition.INCAPACITATED, defaultIcon: 'noSymbol' },
  { id: Condition.INVISIBLE, name: Condition.INVISIBLE, defaultIcon: 'eyeSlash' },
  { id: Condition.PARALYZED, name: Condition.PARALYZED, defaultIcon: 'bolt' },
  { id: Condition.PETRIFIED, name: Condition.PETRIFIED, defaultIcon: 'cube' },
  { id: Condition.POISONED, name: Condition.POISONED, defaultIcon: 'beaker' },
  { id: Condition.PRONE, name: Condition.PRONE, defaultIcon: 'arrowDown' },
  { id: Condition.RESTRAINED, name: Condition.RESTRAINED, defaultIcon: 'lockClosed' },
  { id: Condition.STUNNED, name: Condition.STUNNED, defaultIcon: 'sparkles' },
  { id: Condition.UNCONSCIOUS, name: Condition.UNCONSCIOUS, defaultIcon: 'moon' },
  { id: Condition.EXHAUSTION, name: Condition.EXHAUSTION, defaultIcon: 'clock' },
];

export const STORAGE_KEYS = {
  COMBAT_STATE: 'ttrpg_combat_state',
} as const;

export const FILE = {
  MIME_JSON: 'application/json',
  EXT_JSON: '.json',
} as const;

export const MAGIC = {
  TIE_BREAKER_INITIAL: 1000000,
  SHUFFLE_THRESHOLD: 0.5,
  ID_RADIX: 36,
  ID_SUBSTR_START: 2,
  ID_SUBSTR_LEN: 9
} as const;
