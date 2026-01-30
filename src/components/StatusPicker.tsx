import { useEffect, useLayoutEffect,useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CONDITIONS } from '../models/constants';

interface StatusPickerProps {
    onAdd: (name: string, duration: number) => void;
}

export const StatusPicker = ({ onAdd }: StatusPickerProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedCondition, setSelectedCondition] = useState(CONDITIONS[0]);
    const [duration, setDuration] = useState(1);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    useLayoutEffect(() => {
        if (isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setPosition({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX
            });
        }
    }, [isOpen]);

    const handleAdd = () => {
        onAdd(selectedCondition, duration);
        setIsOpen(false);
        setDuration(1);
        setSelectedCondition(CONDITIONS[0]);
    };

    return (
        <div className="status-picker">
            <button 
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
                className="status-picker__toggle"
                title="Add Status"
            >
                +
            </button>
            {isOpen && createPortal(
                <div className="status-picker__portal-container">
                     <div 
                        className="status-picker__backdrop"
                        onClick={() => setIsOpen(false)} 
                     />
                    <div 
                        ref={dropdownRef}
                        className="status-picker__dropdown"
                        style={{
                            top: position.top,
                            left: position.left,
                            // Ensure it respects the calculated position with absolute positioning
                            // Z-index removed as per strict guidelines (reliance on DOM order)
                        }}
                    >
                        <select 
                            value={selectedCondition} 
                            onChange={(e) => setSelectedCondition(e.target.value)}
                            className="status-picker__select"
                        >
                            {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <div className="status-picker__row">
                            <label className="status-picker__label">Dur:</label>
                            <input 
                                type="number" 
                                min="1" 
                                value={duration} 
                                onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
                                className="status-picker__input-sm"
                            />
                            <span className="status-picker__label">rnds</span>
                        </div>
                        <button onClick={handleAdd} className="status-picker__add-btn">Add</button>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};
