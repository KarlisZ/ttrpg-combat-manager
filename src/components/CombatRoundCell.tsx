import { observer } from 'mobx-react-lite';
import { useLocale } from '../contexts/LocaleContext';
import { useStore } from '../contexts/StoreContext';
import type { Combatant } from '../models/Combatant';
import type { IconName } from '../utils/icons';
import { StatusPicker } from './StatusPicker';

interface CombatRoundCellProps {
    combatant: Combatant;
    roundNum: number;
    isActive: boolean;
    activeIdx: number;
    myIdx: number;
}

export const CombatRoundCell = observer(({ 
    combatant, 
    roundNum, 
    isActive, 
    activeIdx, 
    myIdx
}: CombatRoundCellProps) => {
    const { combatStore: store } = useStore();
    const locale = useLocale();

    const isFutureRound = roundNum > store.currentRound;
    const isFuture = isFutureRound;
    const isCurrentRound = roundNum === store.currentRound;
    // Strict "Current Turn" for UI elements like adding status
    const isStrictlyCurrentTurn = isCurrentRound && activeIdx !== -1 && myIdx === activeIdx;

    const handleAddStatus = (status: { name: string; duration: number; icon: IconName }) => {
        const isDuplicate = combatant.getActiveStatuses(store.currentRound).some(
            (s) => s.name === status.name
        );
        
        if (isDuplicate) {
            const msg = locale.status.error.alreadyApplied.replace('{name}', status.name);
            alert(msg);
            return;
        }

        store.addStatus(combatant.id, status);
    };

    return (
        <td
            className={`combat-row__cell ${isStrictlyCurrentTurn ? 'combat-row__cell--current-round' : ''} ${isFuture ? 'combat-row__cell--future-round' : ''}`}
        >
            <div className="combat-row__cell-content combat-row__cell-content--round">
                <div className="combat-row__input-group">
                    <input
                        type="text"
                        aria-label={`${locale.combatTable.header.round} ${roundNum} HP Input`}
                        placeholder={isStrictlyCurrentTurn ? locale.combatTable.hpInputPlaceholder : undefined}
                        value={combatant.hpLog[roundNum] || ''}
                        onChange={(e) => store.updateHpLog(combatant.id, roundNum, e.target.value)}
                        disabled={isFuture}
                        className={`combat-row__input combat-row__round-input ${
                            isFuture
                                ? 'combat-row__round-input--future'
                                : isStrictlyCurrentTurn && isActive
                                    ? 'combat-row__round-input--active-accent'
                                    : 'combat-row__round-input--other'
                        }`}
                    />
                    {isCurrentRound && (
                        <StatusPicker onAdd={handleAddStatus} />
                    )}
                </div>
            </div>
        </td>
    );
});
