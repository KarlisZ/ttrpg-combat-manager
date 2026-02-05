import { type IReactionDisposer,makeAutoObservable, reaction, toJS } from 'mobx';
import { type IHistoryManager } from '../services/HistoryManager';
import { type IStorageService } from '../services/StorageService';
import { parseMathExpression } from '../utils/mathParser';
import { isAppState } from '../utils/typeGuards';
import { Combatant } from './Combatant';
import { CombatantType, DEFAULTS, MAGIC, STORAGE_KEYS } from './constants';
import { TieBreakerRule } from './types';

export class CombatStore {
  public combatants: Combatant[] = [];
  public currentRound: number = DEFAULTS.STARTING_ROUND;
  public maxRound: number = DEFAULTS.STARTING_ROUND;
  public activeCombatantId: string = '';
  public initiativeDice: number = DEFAULTS.INITIATIVE_DICE;
  public tieBreakerRule: TieBreakerRule = TieBreakerRule.MODIFIER;

  private reactionDisposers: IReactionDisposer[] = [];
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

    // Migration/backstop: ensure persisted maxRound never falls behind currentRound.
    this.maxRound = Math.max(this.maxRound, this.currentRound);

    if (this.historyManager.historyLength === 0) {
      this.historyManager.push(this.jsonState);
    }

    this.setupReactions();
  }

  private setupReactions() {
    this.reactionDisposers.push(
      reaction(
        () => this.jsonState,
        (json) => {
          this.storageService.save(STORAGE_KEYS.COMBAT_STATE, json);
          this.historyManager.push(json);
        }
      )
    );

    this.reactionDisposers.push(
      reaction(
        () => {
          if (this.combatants.length === 0) return null;
          // If active combatant is valid, do nothing
          if (this.activeCombatantId && this.combatants.some((c) => c.id === this.activeCombatantId)) {
            return null;
          }
          // Otherwise, select the first one in turn order
          return this.turnOrder[0]?.id || null;
        },
        (newId) => {
          if (newId) {
            this.activeCombatantId = newId;
          }
        },
        { fireImmediately: true }
      )
    );
  }

  public get jsonState() {
    return JSON.stringify({
      combatants: toJS(this.combatants),
      currentRound: this.currentRound,
      maxRound: this.maxRound,
      activeCombatantId: this.activeCombatantId,
      initiativeDice: this.initiativeDice,
      tieBreakerRule: this.tieBreakerRule,
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
      const incomingMaxRound = state.maxRound ?? state.currentRound ?? DEFAULTS.STARTING_ROUND;
      this.maxRound = Math.max(this.maxRound, incomingMaxRound, this.currentRound);
      if (state.activeCombatantId !== undefined) {
        this.activeCombatantId = state.activeCombatantId || '';
      } else {
         this.activeCombatantId = '';
      }
      this.initiativeDice = state.initiativeDice ?? DEFAULTS.INITIATIVE_DICE;
      this.tieBreakerRule = state.tieBreakerRule ?? TieBreakerRule.MODIFIER;
    } catch (e) {
      console.error('Failed to parse state', e);
    }
  }

  public undo() {
    if (this.historyManager.canUndo) {
      this.reactionDisposers.forEach((d) => d());
      this.reactionDisposers = [];
      try {
        const previousState = this.historyManager.undo();
        if (previousState) {
          this.applyState(previousState);
          this.storageService.save(STORAGE_KEYS.COMBAT_STATE, this.jsonState);
        }
      } finally {
        this.setupReactions();
      }
    }
  }

  public redo() {
    if (this.historyManager.canRedo) {
      this.reactionDisposers.forEach((d) => d());
      this.reactionDisposers = [];
      try {
        const nextState = this.historyManager.redo();
        if (nextState) {
          this.applyState(nextState);
          this.storageService.save(STORAGE_KEYS.COMBAT_STATE, this.jsonState);
        }
      } finally {
        this.setupReactions();
      }
    }
  }


  public removeCombatant(id: string) {
    this.combatants = this.combatants.filter((c) => c.id !== id);
  }

  public get turnOrder(): Combatant[] {
    return this.combatants.slice().sort((a, b) => {
        const totalA = a.initiative + a.initiativeModifier;
        const totalB = b.initiative + b.initiativeModifier;

        if (totalA !== totalB) {
            return totalB - totalA;
        }
        
        // Automatic Tie Resolution
        if (this.tieBreakerRule === TieBreakerRule.MODIFIER) {
            if (a.initiativeModifier !== b.initiativeModifier) {
                return b.initiativeModifier - a.initiativeModifier;
            }
        } else if (this.tieBreakerRule === TieBreakerRule.NAME) {
             const nameA = a.name.toLowerCase();
             const nameB = b.name.toLowerCase();
             if (nameA < nameB) return -1;
             if (nameA > nameB) return 1;
        }

        // Final fallback: tie breaker value (likely 0 or manual set if we kept that valid)
        // or just ID or original insertion order if we wanted stability.
        return b.initiativeTieBreaker - a.initiativeTieBreaker;
    });
  }

  public nextTurn() {
    if (this.combatants.length === 0) return;
    
    // Use turnOrder to determine flow, not insertion order
    const order = this.turnOrder;
    const currentIndex = order.findIndex((c) => c.id === this.activeCombatantId);
    let nextIndex = currentIndex + 1;

    // If currentIndex was -1 (invalid), nextIndex becomes 0, which is correct (start)
    if (nextIndex >= order.length) {
      nextIndex = 0;
      this.currentRound++;
      this.maxRound = Math.max(this.maxRound, this.currentRound);
    }
    
    this.activeCombatantId = order[nextIndex].id;
    this.checkExpiredStatuses(this.activeCombatantId);
  }

  private checkExpiredStatuses(combatantId: string) {
    const combatant = this.combatants.find((c) => c.id === combatantId);
    if (!combatant) return;

    combatant.statuses = combatant.statuses.filter((status) => {
      // Duration 0 = permanent/manual removal
      if (status.duration === 0) return true;
      
      const elapsed = this.currentRound - status.sourceRound;
      return elapsed < status.duration;
    });
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
      // But if we use maxHp + log, clearing log resets them to maxHp.
      // If heroes carry over damage, we might need a "carry over" entry in the new log?
      // For now, adhere to plan: "newCombat should clear the log, which naturally resets Current HP to Max HP"
    });

    this.currentRound = DEFAULTS.STARTING_ROUND;
    this.maxRound = DEFAULTS.STARTING_ROUND;
    this.activeCombatantId = '';
  }

  private insertCombatants(newCombatants: Combatant[]) {
    if (newCombatants.length === 0) return;

    const previouslyActiveId = this.activeCombatantId;
    const previousOrder = this.turnOrder;
    const previousIndex = previousOrder.findIndex(c => c.id === previouslyActiveId);

    this.combatants.push(...newCombatants);

    if (previousIndex !== -1) {
      const newOrder = this.turnOrder;
      // Stay on the same turn index
      if (previousIndex < newOrder.length) {
        this.activeCombatantId = newOrder[previousIndex].id;
      }
    } else {
      if (!this.activeCombatantId && this.turnOrder.length > 0) {
        this.activeCombatantId = this.turnOrder[0].id;
      }
    }
  }

  public spawnHero(name: string, initiative: number) {
    const hero = new Combatant({
      id: crypto.randomUUID(),
      name,
      type: CombatantType.HERO,
      initiative,
      initiativeTieBreaker: 0,
      initiativeModifier: 0,
      maxHp: 10,
      hpLog: {},
      statuses: []
    });
    this.insertCombatants([hero]);
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
            initiative: roll,
            initiativeTieBreaker: 0,
            initiativeModifier: initiativeModifier,
            maxHp: hp,
            hpLog: {},
            statuses: []
        });
        newCombatants.push(monster);
    }
    this.insertCombatants(newCombatants);
  }

  public addCombatant(combatant: Combatant) {
    this.insertCombatants([combatant]);
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
      return c.maxHp + sum;
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

  // Removed tiedCombatantGroups, tiedCombatantIds, autoResolveTies methods

  public addStatus(combatantId: string, status: Omit<Status, 'id' | 'sourceRound'>) {
      const combatant = this.combatants.find(c => c.id === combatantId);
      if (combatant) {
          combatant.statuses.push({
              ...status,
              id: Math.random().toString(MAGIC.ID_RADIX).substr(MAGIC.ID_SUBSTR_START, MAGIC.ID_SUBSTR_LEN),
              sourceRound: this.currentRound,
              sourceId: this.activeCombatantId || undefined
          });
      }
  }

  public updateStatus(combatantId: string, statusId: string, updates: Partial<Omit<Status, 'id' | 'sourceRound'>>) {
      const combatant = this.combatants.find(c => c.id === combatantId);
      if (combatant) {
          const index = combatant.statuses.findIndex(s => s.id === statusId);
          if (index !== -1) {
              // Force array update to ensure reactivity
              const newStatuses = [...combatant.statuses];
              newStatuses[index] = { ...newStatuses[index], ...updates };
              combatant.statuses = newStatuses;
          }
      }
  }

  public removeStatus(combatantId: string, statusId: string) {
      const combatant = this.combatants.find(c => c.id === combatantId);
      if (combatant) {
          combatant.statuses = combatant.statuses.filter(s => s.id !== statusId);
      }
  }

  public get statistics() {
      let heroDamageTaken = 0;
      let monsterDamageTaken = 0;
      
      const combatantStats: Array<{ id: string; name: string; type: CombatantType; damageTaken: number }> = [];
      const damageTakenByTargetTotal: Record<string, number> = {};
      
      this.combatants.forEach(c => {
            let totalDamage = 0;
            Object.values(c.hpLog).forEach(log => {
                let proc = log.replace(/,/g, ' ');
                proc = proc.replace(/(\d)\s+(?=\d)/g, '$1+');
                proc = proc.replace(/\s/g, '');
                
                const matches = proc.match(/[+-]?[0-9]+/g);
                if (matches) {
                    matches.forEach(m => {
                        const val = parseInt(m, 10);
                        if (val < 0) {
                            totalDamage += Math.abs(val);
                        }
                    });
                }
            });

            if (c.type === CombatantType.HERO) {
                heroDamageTaken += totalDamage;
            } else {
                monsterDamageTaken += totalDamage;
            }

            damageTakenByTargetTotal[c.id] = totalDamage;
            combatantStats.push({
                id: c.id,
                name: c.name,
                type: c.type,
                damageTaken: totalDamage
            });
      });
      
      // Sort by damage taken (desc)
      combatantStats.sort((a, b) => b.damageTaken - a.damageTaken);

      const currentRound = Math.max(1, this.currentRound);
      const heroAvgTaken = heroDamageTaken / currentRound;
      const monsterAvgTaken = monsterDamageTaken / currentRound;

      let maxTaken = { name: 'None', amount: 0 };
      if (Object.keys(damageTakenByTargetTotal).length > 0) {
             const maxId = Object.keys(damageTakenByTargetTotal).reduce((a, b) => damageTakenByTargetTotal[a] >= damageTakenByTargetTotal[b] ? a : b);
             const amount = damageTakenByTargetTotal[maxId];
             if (amount > 0) {
                 const c = this.combatants.find(x => x.id === maxId);
                 maxTaken = { name: c?.name || 'Unknown', amount };
             }
      }

      return {
          heroDamage: { total: heroDamageTaken, avgPerRound: heroAvgTaken },
          monsterDamage: { total: monsterDamageTaken, avgPerRound: monsterAvgTaken },
          maxDamageTaken: maxTaken,
          byCombatant: combatantStats
      };
  }

  public exportState(): string {
      const state = {
          combatants: toJS(this.combatants),
          currentRound: this.currentRound,
          maxRound: this.maxRound,
          activeCombatantId: this.activeCombatantId,
          initiativeDice: this.initiativeDice,
          tieBreakerRule: this.tieBreakerRule
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
          
          this.combatants = state.combatants.map((c) => {
              // Migration for legacy statuses without icons
              const statuses = c.statuses?.map(s => ({
                  ...s,
                  icon: s.icon || 'sparkles'
              })) || [];
              
              return new Combatant({ 
                  ...c, 
                  id: c.id || crypto.randomUUID(),
                  statuses
              });
          });
          this.currentRound = state.currentRound || 1;
            this.maxRound = state.maxRound ?? state.currentRound;
            this.maxRound = Math.max(this.maxRound, this.currentRound);
          this.activeCombatantId = state.activeCombatantId || '';
          this.initiativeDice = state.initiativeDice || DEFAULTS.INITIATIVE_DICE;
          this.tieBreakerRule = state.tieBreakerRule || TieBreakerRule.MODIFIER;
      } catch (e) {
          console.error("Failed to import state", e);
          throw new Error("Invalid JSON file");
      }
  }
}
