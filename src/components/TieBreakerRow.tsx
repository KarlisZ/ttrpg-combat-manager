import { observer } from 'mobx-react-lite';
import type { Locale } from '../contexts/LocaleContext';
import type { Combatant } from '../models/Combatant';
import type { CombatStore } from '../models/CombatStore';

interface TieBreakerRowProps {
    combatant: Combatant;
    index: number;
    store: CombatStore;
    isTied: boolean;
    rowClass: string;
    locale: Locale;
}

export const TieBreakerRow = observer(({ combatant, index, store, isTied, rowClass, locale }: TieBreakerRowProps) => (
    <tr
        onClick={() => isTied && store.assignTieBreaker(combatant.id)}
        className={rowClass}
        // Interactive rows in tie breaker need accessible role
        aria-disabled={!isTied}
    >
        {/* Simplified Read-Only View for Tie Breaker */}
        <td className="combat-row__cell">
            {isTied && <span className="combat-row__tie-icon" aria-label={locale.tieBreaker.overlay}>⚡</span>}
        </td>
        <td className="combat-row__cell">{index + 1}</td>
        <td className="combat-row__cell combat-row__bold">{combatant.initiative}</td>
        <td className="combat-row__cell">{combatant.name}</td>
        <td className="combat-row__cell"></td>
        <td className="combat-row__cell"></td>
        <td className="combat-row__cell">{store.getHp(combatant.id)} / {combatant.maxHp}</td>
        <td className="combat-row__cell">{combatant.initiativeModifier}</td>
        {/* Empty cells for round columns to maintain layout */}
        {Array.from({ length: store.currentRound }).map((_, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <td key={`tb-round-val-${i}`}></td>
        ))}
        {/* Placeholder for status pills cells if any */}
    </tr>
));
