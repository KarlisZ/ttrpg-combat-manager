import { makeAutoObservable } from 'mobx';
import type { Combatant } from './Combatant';
import type { CombatStore } from './CombatStore';
import { SortDirection } from './types';

export class UIStore {
    public sortKey: keyof Combatant | null = null;
    public sortDir: SortDirection = SortDirection.DESC;
    public announcement: string = '';
    public hoveredStatusName: string | null = null;

    public constructor(private combatStore: CombatStore) {
        makeAutoObservable(this);
    }

    public setHoveredStatusName(name: string | null) {
        this.hoveredStatusName = name;
    }

    public setSort(key: keyof Combatant) {
        if (this.sortKey === key && this.sortDir === SortDirection.DESC) {
            this.sortDir = SortDirection.ASC;
        } else {
            this.sortKey = key;
            this.sortDir = SortDirection.DESC;
        }
    }

    public toggleOrderSort() {
        if (this.sortKey === null) {
            // Already sorting by default order, toggle direction
            this.sortDir = this.sortDir === SortDirection.DESC ? SortDirection.ASC : SortDirection.DESC;
        } else {
            // Was sorting by specific key, reset to order
            this.sortKey = null;
            this.sortDir = SortDirection.DESC;
        }
    }

    public setAnnouncement(message: string) {
        this.announcement = message;
    }

    public get sortedCombatants() {
        // Default to turnOrder (Initiative sort) when no manual sort is applied
        if (!this.sortKey) {
            const order = this.combatStore.turnOrder;
            // Create a copy before reversing to avoid mutating the computed property from store
            return this.sortDir === SortDirection.ASC ? [...order].reverse() : order;
        }

        const combatants = [...this.combatStore.combatants];

        return combatants.sort((a, b) => {
            // this.sortKey is checked above

            const key = this.sortKey as keyof Combatant;
            const valA = a[key];
            const valB = b[key];

            if (valA === valB) return 0;

            let result = 0;
            if (typeof valA === 'string' && typeof valB === 'string') {
                result = valA.localeCompare(valB);
            } else if (typeof valA === 'number' && typeof valB === 'number') {
                result = valA - valB;
            }

            
            return this.sortDir === SortDirection.ASC ? result : -result;
        });
    }

    public getRowState(combatantId: string) {
        const { activeCombatantId } = this.combatStore;
        const isActive = activeCombatantId === combatantId;
        
        return {
            isActive
        };
    }
}
