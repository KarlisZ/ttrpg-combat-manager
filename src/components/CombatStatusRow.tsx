import { observer } from 'mobx-react-lite';
import { useStore } from '../contexts/StoreContext';
import type { Combatant } from '../models/Combatant';
import { StatusPill } from './StatusPill';

interface CombatStatusRowProps {
    combatant: Combatant;
    displayedRounds: number;
    currentHp: number;
    activeIdx: number;
    myIdx: number;
}

export const CombatStatusRow = observer(({ 
    combatant, 
    displayedRounds, 
    currentHp,
    activeIdx,
    myIdx
}: CombatStatusRowProps) => {
    const { combatStore: store } = useStore();

    return (
        <tr className="combat-row--status">
            {/* Sticky Columns Placeholders - Empty but preserved for layout */}
            <td className="combat-row__cell"></td>
            <td className="combat-row__cell"></td>
            <td className="combat-row__cell"></td>
            <td className="combat-row__cell"></td>
            <td className={`combat-row__cell ${currentHp <= 0 ? 'combat-row__cell--warning' : ''}`}></td>
            
            {/* Status Columns */}
            {Array.from({ length: displayedRounds }).map((_, i) => {
                const roundNum = i + 1;
                const isFutureRound = roundNum > store.currentRound;
                const isFuture = isFutureRound;
                
                const isCurrentRound = roundNum === store.currentRound;
                const isStrictlyCurrentTurn = isCurrentRound && activeIdx !== -1 && myIdx === activeIdx;

                const activeStatuses = combatant.getActiveStatuses(roundNum);

                return (
                    <td
                        key={`status-round-${roundNum}`}
                        className={`combat-row__cell combat-row__cell--status ${isStrictlyCurrentTurn ? 'combat-row__cell--current-round' : ''} ${isFuture ? 'combat-row__cell--future-round' : ''}`}
                    >
                        {activeStatuses.length > 0 && (
                            <div className="combat-row__pills">
                                {activeStatuses.map(s => (
                                    <StatusPill key={s.id} status={s} combatantId={combatant.id} />
                                ))}
                            </div>
                        )}
                    </td>
                );
            })}
        </tr>
    );
});
