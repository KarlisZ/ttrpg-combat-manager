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

export const CONDITIONS = Object.values(Condition);

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
