import { observer } from 'mobx-react-lite';
import { useEffect, useRef } from 'react';
import { useLocale } from '../contexts/LocaleContext';
import { useStore } from '../contexts/StoreContext';

export const StatsModal = observer(({ onClose }: { onClose: () => void }) => {
    const { combatStore: store } = useStore();
    const locale = useLocale();
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        if (dialogRef.current) {
            dialogRef.current.showModal();
        }
    }, []);

    const stats = store.statistics;
    
    const averages = [
        { label: locale.statsModal.heroesTaken, value: stats.heroDamage.avgPerRound, total: stats.heroDamage.total },
        { label: locale.statsModal.monstersTaken, value: stats.monsterDamage.avgPerRound, total: stats.monsterDamage.total }
    ].sort((a, b) => b.total - a.total);

    const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
        if (e.target === dialogRef.current) {
            onClose();
        }
    };

    return (
        <dialog 
            ref={dialogRef} 
            className="modal" 
            onClose={onClose}
            onClick={handleBackdropClick}
        >
            <h3 className="modal-header">{locale.statsModal.title}</h3>
            <div className="modal-body">
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <th style={{ textAlign: 'left', padding: '0.5rem' }}>{locale.statsModal.faction}</th>
                            <th style={{ textAlign: 'right', padding: '0.5rem' }}>{locale.statsModal.total}</th>
                            <th style={{ textAlign: 'right', padding: '0.5rem' }}>{locale.statsModal.averagePerRound}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {averages.map(item => (
                            <tr key={item.label}>
                                <td style={{ padding: '0.5rem' }}>{item.label}</td>
                                <td style={{ textAlign: 'right', padding: '0.5rem' }}>{item.total}</td>
                                <td style={{ textAlign: 'right', padding: '0.5rem' }}>{item.value.toFixed(1)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                <h4 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', fontSize: '1rem' }}>{locale.statsModal.byCombatant}</h4>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)', position: 'sticky', top: 0, background: 'var(--bg-color)' }}>
                                <th style={{ textAlign: 'left', padding: '0.5rem' }}>{locale.combatTable.header.name}</th>
                                <th style={{ textAlign: 'right', padding: '0.5rem' }}>{locale.statsModal.total}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.byCombatant.map(c => (
                                <tr key={c.id} style={{ borderBottom: '1px dashed var(--border-color)' }}>
                                    <td style={{ padding: '0.5rem' }}>{c.name}</td>
                                    <td style={{ textAlign: 'right', padding: '0.5rem' }}>{c.damageTaken}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="modal-actions">
                     <button onClick={onClose} className="btn-primary">{locale.statsModal.close}</button>
                </div>
            </div>
        </dialog>
    );
});
