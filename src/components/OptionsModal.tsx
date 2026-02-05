import { observer } from 'mobx-react-lite';
import { useEffect, useRef } from 'react';
import { useLocale } from '../contexts/LocaleContext';
import { useStore } from '../contexts/StoreContext';
import { TieBreakerRule } from '../models/types';

interface OptionsModalProps {
    onClose: () => void;
}

export const OptionsModal = observer(({ onClose }: OptionsModalProps) => {
    const { combatStore: store } = useStore();
    const locale = useLocale();
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        if (dialogRef.current) {
            dialogRef.current.showModal();
        }
    }, []);

    const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
        if (e.target === dialogRef.current) {
            dialogRef.current.close();
        }
    };

    return (
        <dialog 
            ref={dialogRef} 
            className="modal" 
            onClose={onClose}
            onClick={handleBackdropClick}
        >
            <h3 className="modal-header">{locale.optionsModal.title}</h3>
            
            <div className="modal-body">
                <div className="modal-field">
                     <label className="modal-label">{locale.optionsModal.initiativeDie}</label>
                     <select 
                        className="modal-select"
                        value={store.initiativeDice} 
                        onChange={(e) => store.initiativeDice = parseInt(e.target.value)}
                    >
                        <option value={4}>d4</option>
                        <option value={6}>d6</option>
                        <option value={8}>d8</option>
                        <option value={10}>d10</option>
                        <option value={12}>d12</option>
                        <option value={20}>d20</option>
                        <option value={100}>d100</option>
                    </select>
                </div>

                <div className="modal-field">
                     <label className="modal-label">{locale.optionsModal.tieBreakerRule}</label>
                     <select
                        className="modal-select"
                        value={store.tieBreakerRule}
                        onChange={(e) => store.tieBreakerRule = e.target.value as TieBreakerRule}
                    >
                        <option value={TieBreakerRule.MODIFIER}>{locale.optionsModal.tieBreakerRules.modifier}</option>
                         <option value={TieBreakerRule.NAME}>{locale.optionsModal.tieBreakerRules.name}</option>
                     </select>
                </div>
            </div>

            <div className="modal-actions">
                <button onClick={() => dialogRef.current?.close()}>{locale.optionsModal.close}</button>
            </div>
        </dialog>
    );
});
