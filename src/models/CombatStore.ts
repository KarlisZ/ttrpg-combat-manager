import { type IReactionDisposer,makeAutoObservable, reaction, toJS } from 'mobx';
import { type IHistoryManager } from '../services/HistoryManager';
import { type IStorageService } from '../services/StorageService';
import { parseMathExpression } from '../utils/mathParser';
import { isAppState } from '../utils/typeGuards';
import { Combatant } from './Combatant';
import { CombatantType, DEFAULTS, MAGIC, STORAGE_KEYS } from './constants';
import type { Status } from './types';

export class CombatStore {
  public combatants: Combatant[] = [];
  public currentRound: number = DEFAULTS.STARTING_ROUND;
  public activeCombatantId: string = '';
  public initiativeDice: number = DEFAULTS.INITIATIVE_DICE;
  public tieBreakerMode = false;
  public autoResolveTiesEnabled = false;

  private reactionDisposer: IReactionDisposer | null = null;
  private readonly historyManager: IHistoryManager<string>;
  private readonly storageService: IStorageService;

  public constructor(
    storageService: IStorageService,
    historyManager: IHistoryManager<string>
  ) {
    this.storageService = storageService;
    this.historyManager = historyManager;

    makeAutoObservable(this);
    this.loadState();

    if (this.historyManager.historyLength === 0) {
      this.historyManager.push(this.jsonState);
    }

    this.setupReaction();
  }

  private setupReaction() {
    this.reactionDisposer = reaction(
      () => this.jsonState,
      (json) => {
        this.storageService.save(STORAGE_KEYS.COMBAT_STATE, json);
        this.historyManager.push(json);
      }
    );
  }

  public get jsonState() {
    return JSON.stringify({
      combatants: toJS(this.combatants),
      currentRound: this.currentRound,
      activeCombatantId: this.activeCombatantId,
      initiativeDice: this.initiativeDice,
      tieBreakerMode: this.tieBreakerMode,
      autoResolveTiesEnabled: this.autoResolveTiesEnabled,
    });
  }

  // Exposed for testing if needed, or just use the interface methods
  public get historyState() {
    return {
      canUndo: this.historyManager.canUndo,
      canRedo: this.historyManager.canRedo,
      length: this.historyManager.historyLength,
    };
  }

  public get canUndo() {
    return this.historyManager.canUndo;
  }

  public get canRedo() {
    return this.historyManager.canRedo;
  }

  private loadState() {
    try {
      const saved = this.storageService.load(STORAGE_KEYS.COMBAT_STATE);
      if (saved) {
        this.applyState(saved);
      }
    } catch (e) {
      console.warn('Failed to load state', e);
    }
  }

  private applyState(json: string) {
    try {
      const state = JSON.parse(json);
      // Validate
      if (!isAppState(state)) {
          throw new Error("Invalid state shape");
      }
      this.combatants = state.combatants.map((c) => new Combatant({ ...c, id: c.id || crypto.randomUUID() }));
      this.currentRound = state.currentRound ?? DEFAULTS.STARTING_ROUND;
      if (state.activeCombatantId !== undefined) {
        this.activeCombatantId = state.activeCombatantId || '';
      } else {
         this.activeCombatantId = '';
      }
      this.initiativeDice = state.initiativeDice ?? DEFAULTS.INITIATIVE_DICE;
      this.tieBreakerMode = state.tieBreakerMode ?? false;
      this.autoResolveTiesEnabled = state.autoResolveTiesEnabled ?? false;
    } catch (e) {
      console.error('Failed to parse state', e);
    }
  }

  public undo() {
    if (this.historyManager.canUndo) {
      if (this.reactionDisposer) this.reactionDisposer();
      try {
        const previousState = this.historyManager.undo();
        if (previousState) {
          this.applyState(previousState);
          this.storageService.save(STORAGE_KEYS.COMBAT_STATE, previousState);
        }
      } finally {
        this.setupReaction();
      }
    }
  }

  public redo() {
    if (this.historyManager.canRedo) {
      if (this.reactionDisposer) this.reactionDisposer();
      try {
        const nextState = this.historyManager.redo();
        if (nextState) {
          this.applyState(nextState);
          this.storageService.save(STORAGE_KEYS.COMBAT_STATE, nextState);
        }
      } finally {
        this.setupReaction();
      }
    }
  }


  public removeCombatant(id: string) {
    this.combatants = this.combatants.filter((c) => c.id !== id);
  }

  public get turnOrder(): Combatant[] {
    return this.combatants.slice().sort((a, b) => {
        if (a.initiative !== b.initiative) {
            return b.initiative - a.initiative;
        }
        return b.initiativeTieBreaker - a.initiativeTieBreaker;
    });
  }

  public nextTurn() {
    if (this.combatants.length === 0) return;
    
    // Use turnOrder to determine flow, not insertion order
    const order = this.turnOrder;
    const currentIndex = order.findIndex((c) => c.id === this.activeCombatantId);
    let nextIndex = currentIndex + 1;

    if (currentIndex === -1) {
       nextIndex = 0;
    }

    if (nextIndex >= order.length) {
      nextIndex = 0;
      this.currentRound++;
    }
    
    this.activeCombatantId = order[nextIndex].id;
  }

  public previousTurn() {
    if (this.combatants.length === 0) return;

    const order = this.turnOrder;
    const currentIndex = order.findIndex((c) => c.id === this.activeCombatantId);
    let prevIndex = currentIndex - 1;

    if (currentIndex === -1) {
        prevIndex = 0;
    }

    if (prevIndex < 0) {
      if (this.currentRound > 1) {
        this.currentRound--;
        prevIndex = order.length - 1;
      } else {
        prevIndex = 0;
      }
    }
    this.activeCombatantId = order[prevIndex].id;
  }

  public newCombat() {
    this.combatants = this.combatants.filter((c) => c.type === CombatantType.HERO);
    this.combatants.forEach((c) => {
      c.initiative = 0;
      c.statuses = [];
      c.hpLog = {};
      // Reset heroes to starting implementation if suitable, but usually they kept state.
      // But if we use startingHp + log, clearing log resets them to startingHp.
      // If heroes carry over damage, we might need a "carry over" entry in the new log?
      // For now, adhere to plan: "newCombat should clear the log, which naturally resets Current HP to Starting HP"
    });

    this.currentRound = DEFAULTS.STARTING_ROUND;
    this.activeCombatantId = '';
  }

  public spawnHero(name: string, initiative: number) {
    const hero = new Combatant({
      id: crypto.randomUUID(),
      name,
      type: CombatantType.HERO,
      initiative,
      initiativeTieBreaker: 0,
      initiativeModifier: 0,
      startingHp: 0,
      maxHp: 0,
      hpLog: {},
      statuses: []
    });
    this.addCombatant(hero);
  }

  public spawnMonster(name: string, hp: number, initiativeModifier: number, count: number) {
    const newCombatants: Combatant[] = [];
    for (let i = 0; i < count; i++) {
        const monsterName = count > 1 ? `${name} ${i + 1}` : name;
        const roll = Math.floor(Math.random() * this.initiativeDice) + 1;
        const monster = new Combatant({
            id: crypto.randomUUID(),
            name: monsterName,
            type: CombatantType.MONSTER,
            initiative: roll + initiativeModifier,
            initiativeTieBreaker: 0,
            initiativeModifier: initiativeModifier,
            startingHp: hp,
            maxHp: hp,
            hpLog: {},
            statuses: []
        });
        newCombatants.push(monster);
    }
    this.combatants.push(...newCombatants);
    // Reactivity handles sort
  }

  public addCombatant(combatant: Combatant) {
    this.combatants.push(combatant);
    // Sort logic moved to computed 'turnOrder'
    // this.sortCombatants(); 
  }

  public updateCombatant(id: string, diff: Partial<Combatant>) {
      const c = this.combatants.find(x => x.id === id);
      if (c) {
          Object.assign(c, diff);
          // Reactivity handles the rest
      }
  }

  public getHp(combatantId: string): number {
      const c = this.combatants.find(x => x.id === combatantId);
      if (!c) return 0;
      
      let sum = 0;
      if (c.hpLog) {
          Object.values(c.hpLog).forEach(log => {
              sum += parseMathExpression(log);
          });
      }
      return c.startingHp + sum;
  }

  public rollInitiative(combatantIds: string[]) {
    combatantIds.forEach((id) => {
      const c = this.combatants.find((x) => x.id === id);
      if (c) {
        const roll = Math.floor(Math.random() * this.initiativeDice) + 1;
        c.initiative = roll + c.initiativeModifier;
        c.initiativeTieBreaker = 0;
      }
    });
    if (this.autoResolveTiesEnabled) {
      this.autoResolveTies();
    }
    // Reactivity handles sort
  }

  // Removed sortCombatants() - use computed turnOrder

  public get activeCombatant(): Combatant | undefined {
      return this.combatants.find((c) => c.id === this.activeCombatantId);
  }

  public modifyHp(combatantId: string, input: string) {
    // Legacy wrapper or helper if needed, but we essentially just want to append to current round
    // However, the UI might bind directly to definition of the log string.
    // If we use this method (e.g. from a command bar), we append.
    const c = this.combatants.find((x) => x.id === combatantId);
    if (!c) return;

    const round = this.currentRound;
    const existing = c.hpLog[round] || '';
    // We use space as separator if existing content acts as independent terms
    // But math parser handles " " as ignored.
    // If we want "-5" and "-2", "-5 -2" works.
    // If we have "-5" and "2", "-5 2" -> sum is -3. (Assuming 2 is +2).
    // If user enters "2" (meaning +2 healing or just positive), we might need explicit sign if we leave it to parser?
    // mathParser("5 2") -> 5+2 = 7.
    // So space separation is fine for parser.
    const newValue = existing ? `${existing}, ${input}` : input;
    this.updateHpLog(combatantId, round, newValue);
  }

  public updateHpLog(combatantId: string, round: number, newValue: string) {
      const c = this.combatants.find((x) => x.id === combatantId);
      if (!c) return;

      // We no longer mutate an imperative hp property.
      // The store computes current HP from startingHp + logs.
      c.hpLog[round] = newValue;
  }

  public get tiedCombatantGroups(): Combatant[][] {
      const groups = new Map<number, Combatant[]>();
      this.combatants.forEach(c => {
          const list = groups.get(c.initiative);
          if (list) {
              list.push(c);
          } else {
              groups.set(c.initiative, [c]);
          }
      });
      
      const ties: Combatant[][] = [];
      groups.forEach(group => {
          if (group.length > 1) {
              const uniqueScores = new Set(group.map(c => c.initiativeTieBreaker));
              // If we have fewer unique tie breaker scores than combatants, there is a collision
              if (uniqueScores.size < group.length) {
                  ties.push(group);
              }
          }
      });
      return ties;
  }

  public get tiedCombatantIds(): Set<string> {
      const ids = new Set<string>();
      this.tiedCombatantGroups.forEach(group => {
          group.forEach(c => ids.add(c.id));
      });
      return ids;
  }

  public autoResolveTies() {
      const groups = this.tiedCombatantGroups;
      groups.forEach(group => {
          // Sort tie-breaker candidates by their stable insertion order (index in main combatants list)
          const sorted = group.slice().sort((a, b) => {
              return this.combatants.indexOf(a) - this.combatants.indexOf(b);
          });
          
          // Assign tie breakers such that the first-added combatant (lowest index)
          // gets the highest tie breaker value, ensuring they go first in the turn order.
          const count = sorted.length;
          sorted.forEach((c, index) => {
              c.initiativeTieBreaker = count - 1 - index; 
          });
      });
      // Reactivity handles sort
  }

  private tieBreakerCounter = MAGIC.TIE_BREAKER_INITIAL;

  public assignTieBreaker(combatantId: string) {
      const c = this.combatants.find(x => x.id === combatantId);
      if (c) {
          c.initiativeTieBreaker = this.tieBreakerCounter--;
          // Reactivity handles sort
      }
  }

  public addStatus(combatantId: string, status: Omit<Status, 'id' | 'sourceRound'>) {
      const combatant = this.combatants.find(c => c.id === combatantId);
      if (combatant) {
          combatant.statuses.push({
              ...status,
              id: Math.random().toString(MAGIC.ID_RADIX).substr(MAGIC.ID_SUBSTR_START, MAGIC.ID_SUBSTR_LEN),
              sourceRound: this.currentRound
          });
      }
  }

  public removeStatus(combatantId: string, statusId: string) {
      const combatant = this.combatants.find(c => c.id === combatantId);
      if (combatant) {
          combatant.statuses = combatant.statuses.filter(s => s.id !== statusId);
      }
  }

  public exportState(): string {
      const state = {
          combatants: toJS(this.combatants),
          currentRound: this.currentRound,
          activeCombatantId: this.activeCombatantId,
          initiativeDice: this.initiativeDice,
          tieBreakerMode: this.tieBreakerMode,
          autoResolveTiesEnabled: this.autoResolveTiesEnabled
      };
      return JSON.stringify(state, null, 2);
  }

  public importState(json: string) {
      try {
          const state = JSON.parse(json);
          // Simple validation could be added here
          if (!isAppState(state)) {
             throw new Error("Invalid JSON file: schema mismatch");
          }
          
          this.combatants = state.combatants.map((c) => new Combatant({ ...c, id: c.id || crypto.randomUUID() }));
          this.currentRound = state.currentRound || 1;
          this.activeCombatantId = state.activeCombatantId || '';
          this.initiativeDice = state.initiativeDice || DEFAULTS.INITIATIVE_DICE;
          this.tieBreakerMode = state.tieBreakerMode || false;
          this.autoResolveTiesEnabled = state.autoResolveTiesEnabled || false;
      } catch (e) {
          console.error("Failed to import state", e);
          throw new Error("Invalid JSON file");
      }
  }
}
