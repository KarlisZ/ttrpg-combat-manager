import { reaction } from 'mobx';
import { observer } from 'mobx-react-lite';
import { useEffect, useRef, useState } from 'react';
import { useLocale } from '../contexts/LocaleContext';
import { useStore } from '../contexts/StoreContext';
import type { Combatant } from '../models/Combatant';
import { SortDirection } from '../models/types';
import { CombatRow } from './CombatRow';

export const CombatTable = observer(() => {
  const { combatStore: store, uiStore } = useStore();
  const locale = useLocale();
  const [announcement, setAnnouncement] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (containerRef.current) {
        const currentHeader = containerRef.current.querySelector(`[data-round="${store.currentRound}"]`);
        if (currentHeader) {
            currentHeader.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }
  }, [store.currentRound]);

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
    <div ref={containerRef} role="region" aria-label={locale.combatTable.ariaLabel} tabIndex={0} className="combat-table__container">
        <div role="status" aria-live="polite" className="visually-hidden">
            {announcement}
        </div>
        <table className="combat-table">
            <thead className="combat-table__thead">
                <tr>
                    <th className="combat-table__th"></th> {/* Delete */}
                    <th 
                        className="combat-table__th"
                        aria-sort={uiStore.sortKey === null ? (uiStore.sortDir === SortDirection.ASC ? 'descending' : 'ascending') : undefined}
                    >
                        <button
                            onClick={() => uiStore.toggleOrderSort()}
                            className="combat-table__th-button"
                        >
                            {locale.combatTable.header.order} {uiStore.sortKey === null ? (uiStore.sortDir === SortDirection.ASC ? locale.combatTable.indicators.down : locale.combatTable.indicators.up) : ''}
                        </button>
                    </th>
                    <th className="combat-table__th">{locale.combatTable.header.initMod}</th>
                    {renderSortHeader('name', locale.combatTable.header.name)}
                    <th className="combat-table__th">{locale.combatTable.header.currentMax}</th>
                    {Array.from({ length: store.maxRound }).map((_, i) => {
                        const roundNum = i + 1;
                        const isFuture = roundNum > store.currentRound;

                        return (
                            <th
                                key={`round-${roundNum}`}
                                className={`combat-table__th ${isFuture ? 'combat-table__th--future-round' : ''}`}
                                data-round={roundNum}
                            >
                                {locale.combatTable.header.round} {roundNum}
                            </th>
                        );
                    })}
                </tr>
            </thead>
            {uiStore.sortedCombatants.map((combatant) => (
                <CombatRow key={combatant.id} combatant={combatant} />
            ))}
        </table>
        {store.combatants.length === 0 && (
            <div className="combat-table__empty">
                {locale.combatTable.emptyState}
            </div>
        )}
    </div>
  );
});
