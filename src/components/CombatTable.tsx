import { reaction } from 'mobx';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { useLocale } from '../contexts/LocaleContext';
import { useStore } from '../contexts/StoreContext';
import type { Combatant } from '../models/Combatant';
import { SortDirection } from '../models/types';
import { CombatRow } from './CombatRow';

export const CombatTable = observer(() => {
  const { combatStore: store, uiStore } = useStore();
  const locale = useLocale();
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
      const dispose = reaction(
          () => ({ round: store.currentRound, name: store.activeCombatant?.name }),
          ({ round, name }) => {
              if (name) {
                  const msg = locale.combatTable.turnAnnouncement
                    .replace('{round}', round.toString())
                    .replace('{name}', name);
                  setAnnouncement(msg);
              }
          }
      );
      return () => dispose();
  }, [store, locale.combatTable.turnAnnouncement]);

  const handleSort = (key: keyof Combatant) => {
      uiStore.setSort(key);
  };

  const renderSortHeader = (key: keyof Combatant, label: string) => (
      <th 
        className="combat-table__th"
        aria-sort={uiStore.sortKey === key ? (uiStore.sortDir === SortDirection.ASC ? 'ascending' : 'descending') : undefined}
      >
        <button
            onClick={() => handleSort(key)}
            className="combat-table__th-button"
        >
          {label} {uiStore.sortKey === key ? (uiStore.sortDir === SortDirection.ASC ? locale.combatTable.indicators.up : locale.combatTable.indicators.down) : ''}
        </button>
      </th>
  );

  return (
    <div role="region" aria-label={locale.combatTable.ariaLabel} tabIndex={0} className="combat-table__container">
        <div role="status" aria-live="polite" className="visually-hidden">
            {announcement}
        </div>
        {store.tieBreakerMode && (
             <div className="combat-table__overlay">
                 {locale.tieBreaker.overlay}
             </div>
        )}
        <table className="combat-table">
            <thead className="combat-table__thead">
                <tr>
                    <th className="combat-table__th"></th> {/* Delete */}
                    <th className="combat-table__th">{locale.combatTable.header.order}</th>
                    {renderSortHeader('initiative', locale.combatTable.header.initiative)}
                    {renderSortHeader('name', locale.combatTable.header.name)}
                    <th className="combat-table__th">{locale.combatTable.header.status}</th>
                    {renderSortHeader('startingHp', locale.combatTable.header.startingHp)}
                    <th className="combat-table__th">{locale.combatTable.header.currentMax}</th>
                    {renderSortHeader('initiativeModifier', locale.combatTable.header.modifier)}
                    {Array.from({ length: store.currentRound }).map((_, i) => (
                        <th key={`round-${i + 1}`} className="combat-table__th">
                            {locale.combatTable.header.round} {i + 1}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {uiStore.sortedCombatants.map((combatant, index) => (
                    <CombatRow key={combatant.id} combatant={combatant} index={index} />
                ))}
            </tbody>
        </table>
        {store.combatants.length === 0 && (
            <div className="combat-table__empty">
                {locale.combatTable.emptyState}
            </div>
        )}
    </div>
  );
});
