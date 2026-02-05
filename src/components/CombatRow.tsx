import { observer } from 'mobx-react-lite';
import { useLocale } from '../contexts/LocaleContext';
import { useStore } from '../contexts/StoreContext';
import type { Combatant } from '../models/Combatant';
import { BufferedInput } from './BufferedInput';
import { CombatRoundCell } from './CombatRoundCell';
import { CombatStatusRow } from './CombatStatusRow';

interface CombatRowProps {
    combatant: Combatant;
}

 
export const CombatRow = observer(({ combatant }: CombatRowProps) => {
    const { combatStore: store, uiStore } = useStore();
    const locale = useLocale();

    const displayedRounds = store.maxRound;

    const handleDelete = () => {
        store.removeCombatant(combatant.id);
    };

    const handleChange = <K extends keyof Combatant>(field: K, value: Combatant[K]) => {
        store.updateCombatant(combatant.id, { [field]: value });
    };

    const currentHp = store.getHp(combatant.id);

    const { isActive } = uiStore.getRowState(combatant.id);
    
    // Calculate turn status
    const turnOrder = store.turnOrder;
    const activeIdx = turnOrder.findIndex((c) => c.id === store.activeCombatantId);
    const myIdx = turnOrder.findIndex((c) => c.id === combatant.id);

    let rowClass = 'combat-row';

    if (isActive) {
        if (currentHp <= 0) {
                rowClass += ' combat-row--active-dead';
        } else {
            rowClass += ' combat-row--active';
        }
    }
    else rowClass += ' combat-row--inactive';

    const hasStatusesInDisplayedRounds = Array.from({ length: displayedRounds }).some((_, i) =>
        combatant.getActiveStatuses(i + 1).length > 0
    );

    // Split into Main Row (Inputs) and Status Row (Pills)
    // Wrapped in tbody to ensure they are treated as a single unit
    
    return (
        <tbody className={`${rowClass} combat-row-group`}>
            <tr className={`combat-row--main ${!hasStatusesInDisplayedRounds ? 'combat-row--single' : ''}`}>
                <td className="combat-row__cell">
                    <button
                        onClick={handleDelete}
                        title={locale.combatTable.deleteRowTitle}
                        aria-label={locale.combatTable.deleteRowTitle}
                        className="combat-row__delete-btn"
                    >
                        ✖
                    </button>
                </td>
                <td className="combat-row__cell">
                    <div className="combat-row__index-container">
                        <span>{myIdx + 1}</span>
                        <span className="combat-row__index-sub">({combatant.initiative + combatant.initiativeModifier})</span>
                    </div>
                </td>
                <td className="combat-row__cell">
                    <div className="combat-row__init-mod-container">
                        <BufferedInput
                            ariaLabel={locale.combatTable.header.initiative}
                            value={combatant.initiative}
                            onChange={(val) => handleChange('initiative', val)}
                            className="combat-row__input-sm"
                        />
                         <span className="combat-row__separator">+</span>
                        <BufferedInput
                            ariaLabel={locale.combatTable.header.modifier}
                            value={combatant.initiativeModifier}
                            onChange={(val) => handleChange('initiativeModifier', val)}
                            className="combat-row__input-sm"
                        />
                    </div>
                </td>
                <td className="combat-row__cell">
                    <div className="combat-row__name-container">
                        <input
                            type="text"
                            aria-label={locale.combatTable.header.name}
                            value={combatant.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            className="combat-row__input"
                        />
                    </div>
                </td>

                <td className={`combat-row__cell ${currentHp <= 0 ? 'combat-row__cell--warning' : ''}`}>
                    <div className="combat-row__hp-container">
                        <span
                            aria-label={locale.combatTable.header.hp}
                            className="combat-row__hp-display"
                        >
                            {currentHp}
                        </span>
                        <span>/</span>
                        <BufferedInput
                            ariaLabel={locale.combatTable.header.maxHp}
                            value={combatant.maxHp}
                            onChange={(val) => handleChange('maxHp', val)}
                            className="combat-row__input-sm combat-row__input-xs"
                        />
                    </div>
                </td>
                {Array.from({ length: displayedRounds }).map((_, i) => (
                    <CombatRoundCell
                        key={`round-${i + 1}`}
                        combatant={combatant}
                        roundNum={i + 1}
                        isActive={isActive}
                        activeIdx={activeIdx}
                        myIdx={myIdx}
                    />
                ))}
            </tr>
            
            {hasStatusesInDisplayedRounds && (
                <CombatStatusRow
                    combatant={combatant}
                    displayedRounds={displayedRounds}
                    currentHp={currentHp}
                    activeIdx={activeIdx}
                    myIdx={myIdx}
                />
            )}
        </tbody>
    );
});
