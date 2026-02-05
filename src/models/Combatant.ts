import { makeAutoObservable } from 'mobx';
import { CombatantType } from './constants';
import type { Status } from './types';

export class Combatant {
    public id: string = '';
    public name: string = '';
    public type: CombatantType = CombatantType.HERO;
    public initiative: number = 0;
    public initiativeTieBreaker: number = 0;
    public initiativeModifier: number = 0;
    public maxHp: number = 0;
    public hpLog: Record<number, string> = {};
    public statuses: Status[] = [];

    public constructor(data: Partial<Combatant> & { id: string }) {
        makeAutoObservable(this);
        this.id = data.id;
        if (data.name !== undefined) this.name = data.name;
        if (data.type !== undefined) this.type = data.type;
        if (data.initiative !== undefined) this.initiative = data.initiative;
        if (data.initiativeTieBreaker !== undefined) this.initiativeTieBreaker = data.initiativeTieBreaker;
        if (data.initiativeModifier !== undefined) this.initiativeModifier = data.initiativeModifier;
        if (data.maxHp !== undefined) this.maxHp = data.maxHp;
        if (data.hpLog !== undefined) this.hpLog = data.hpLog;
        if (data.statuses !== undefined) {
            this.statuses = data.statuses.map(s => ({
                ...s,
                icon: s.icon || 'sparkles'
            }));
        }
    }

    public getActiveStatuses(currentRound: number): Status[] {
        return this.statuses.filter(s => 
            currentRound >= s.sourceRound && 
            currentRound < s.sourceRound + s.duration
        );
    }

    public get totalInitiative(): number {
        return this.initiative + this.initiativeModifier;
    }

    public getFutureStatuses(currentRound: number): Status[] {
        return this.statuses.filter(s => s.sourceRound > currentRound);
    }
}
