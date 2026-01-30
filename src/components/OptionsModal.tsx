import { observer } from 'mobx-react-lite';
import { useEffect,useRef } from 'react';
import { useLocale } from '../contexts/LocaleContext';
import { useStore } from '../contexts/StoreContext';

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

                <label className="modal-label modal-checkbox-label">
                     <input 
                        type="checkbox"
                        checked={store.autoResolveTiesEnabled}
                        onChange={(e) => store.autoResolveTiesEnabled = e.target.checked}
                     />
                     {locale.optionsModal.autoResolveTies}
                </label>
            </div>

            <div className="modal-actions">
                <button onClick={() => dialogRef.current?.close()}>{locale.optionsModal.close}</button>
            </div>
        </dialog>
    );
});
