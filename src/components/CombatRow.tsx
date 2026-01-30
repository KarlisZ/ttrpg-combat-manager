import { observer } from 'mobx-react-lite';
import { useLocale } from '../contexts/LocaleContext';
import { useStore } from '../contexts/StoreContext';
import type { Combatant } from '../models/Combatant';
import { BufferedInput } from './BufferedInput';
import { StatusPicker } from './StatusPicker';
import { TieBreakerRow } from './TieBreakerRow';

interface CombatRowProps {
    combatant: Combatant;
    index: number;
}

// eslint-disable-next-line max-lines-per-function
export const CombatRow = observer(({ combatant, index }: CombatRowProps) => {
    const { combatStore: store, uiStore } = useStore();
    const locale = useLocale();

    const handleDelete = () => {
        store.removeCombatant(combatant.id);
    };

    const handleChange = <K extends keyof Combatant>(field: K, value: Combatant[K]) => {
        store.updateCombatant(combatant.id, { [field]: value });
    };

    const { isTieBreakerMode, isTied, isActive } = uiStore.getRowState(combatant.id);

    let rowClass = 'combat-row';
    if (isTieBreakerMode) {
        rowClass += ' combat-row--tie-breaker';
        if (isTied) rowClass += ' combat-row--tie-breaker-active';
    } else {
        if (isActive) rowClass += ' combat-row--active';
        else if (index % 2 !== 0) rowClass += ' combat-row--alt';
        else rowClass += ' combat-row--inactive';
    }

    if (isTieBreakerMode) {
        return <TieBreakerRow combatant={combatant} index={index} store={store} isTied={isTied} rowClass={rowClass} locale={locale} />;
    }

    return (
        <tr className={rowClass}>
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
                {index + 1}
            </td>
            <td className="combat-row__cell">
                <BufferedInput
                    ariaLabel={locale.combatTable.header.initiative}
                    value={combatant.initiative}
                    onChange={(val) => handleChange('initiative', val)}
                    className="combat-row__input-sm"
                />
            </td>
            <td className="combat-row__cell">
                <input
                    type="text"
                    aria-label={locale.combatTable.header.name}
                    value={combatant.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                />
            </td>
            <td className="combat-row__cell">
                <div className="combat-row__status-container">
                    {combatant.getActiveStatuses(store.currentRound)
                        .map(s => (
                            <span
                                key={s.id}
                                className="combat-row__status-pill"
                                title={`${s.name} (Expires Round ${s.sourceRound + s.duration})`}
                                onClick={() => {
                                    if (confirm(locale.combatTable.removeStatusConfirm.replace('{name}', s.name))) {
                                        store.removeStatus(combatant.id, s.id);
                                    }
                                }}
                            >
                                {s.name}
                            </span>
                        ))
                    }
                    {combatant.getFutureStatuses(store.currentRound)
                        .map(s => (
                            <span
                                key={s.id}
                                className="combat-row__status-pill--future"
                                title={`Future Status: ${s.name} (Starts Round ${s.sourceRound})`}
                            >
                                {s.name} ⏳
                            </span>
                        ))
                    }
                    <StatusPicker onAdd={(name, duration) => store.addStatus(combatant.id, { name, duration })} />
                </div>
            </td>
            <td className="combat-row__cell">
                <BufferedInput
                    ariaLabel={locale.combatTable.header.startingHp}
                    value={combatant.startingHp}
                    onChange={(val) => handleChange('startingHp', val)}
                    className="combat-row__input-sm combat-row__input-xs"
                />
            </td>
            <td className="combat-row__cell">
                <div className="combat-row__hp-container">
                    <span
                        aria-label={locale.combatTable.header.hp}
                        className="combat-row__hp-display"
                    >
                        {store.getHp(combatant.id)}
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
            <td className="combat-row__cell">
                <BufferedInput
                    ariaLabel={locale.combatTable.header.modifier}
                    value={combatant.initiativeModifier}
                    onChange={(val) => handleChange('initiativeModifier', val)}
                    className="combat-row__input-sm"
                />
            </td>
            {Array.from({ length: store.currentRound }).map((_, i) => {
                const roundNum = i + 1;
                const isCurrent = roundNum === store.currentRound;

                return (
                    <td key={`round-${roundNum}`} className="combat-row__cell">
                        <div className="combat-row__cell-content">
                            <input
                                type="text"
                                aria-label={`${locale.combatTable.header.round} ${roundNum} HP Input`}
                                value={combatant.hpLog[roundNum] || ''}
                                onChange={(e) => store.updateHpLog(combatant.id, roundNum, e.target.value)}
                                className={`combat-row__input combat-row__round-input ${isCurrent ? 'combat-row__round-input--current' : 'combat-row__round-input--other'}`}
                            />
                        </div>
                    </td>
                );
            })}
        </tr>
    );
});
