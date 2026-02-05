import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocale } from '../contexts/LocaleContext';
import type { ConditionDefinition} from '../models/constants';
import {CONDITIONS } from '../models/constants';
import type { IconName} from '../utils/icons';
import { ICONS } from '../utils/icons';
import { IconPicker } from './IconPicker';

interface StatusPickerProps {
    onAdd: (status: { name: string; duration: number; icon: IconName }) => void;
}

type Tab = 'presets' | 'custom';

// eslint-disable-next-line max-lines-per-function
export const StatusPicker = ({ onAdd }: StatusPickerProps) => {
    const locale = useLocale();
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>('presets');
    const [position, setPosition] = useState({ top: 0, left: 0 });
    
    // Custom form state
    const [customName, setCustomName] = useState('');
    const [customDuration, setCustomDuration] = useState(1);
    const [customIcon, setCustomIcon] = useState<IconName>('sparkles');

    const buttonRef = useRef<HTMLButtonElement>(null);
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
        if (isOpen && buttonRef.current && dropdownRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const dropdownRect = dropdownRef.current.getBoundingClientRect();
            
            let left = rect.left + window.scrollX;
            const top = rect.bottom + window.scrollY;

            // Collision detection: if dropdown goes off right screen edge, align to right of button
            if (rect.left + dropdownRect.width > window.innerWidth) {
                 left = (rect.right + window.scrollX) - dropdownRect.width;
            }

            // Safety check for left edge
            if (left < 0) left = 0;

            setPosition({ top, left });
        }
    }, [isOpen]);

    const handlePresetClick = (condition: ConditionDefinition) => {
        onAdd({ 
            name: condition.name, 
            duration: 1, 
            icon: condition.defaultIcon 
        });
        setIsOpen(false);
    };

    const handleCustomAdd = () => {
        if (!customName.trim()) return;
        onAdd({
            name: customName,
            duration: customDuration,
            icon: customIcon
        });
        setIsOpen(false);
        setCustomName('');
        setCustomDuration(1);
        setCustomIcon('sparkles');
    };

    return (
        <div className="status-picker">
            <button 
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
                className="status-picker__toggle"
                title={locale.statusPicker.add}
                type="button"
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
                        }}
                    >
                        <div className="status-picker__tabs">
                            <button 
                                className={`status-picker__tab ${activeTab === 'presets' ? 'status-picker__tab--active' : ''}`}
                                onClick={() => setActiveTab('presets')}
                            >{locale.status.presetStatus}</button>
                            <button 
                                className={`status-picker__tab ${activeTab === 'custom' ? 'status-picker__tab--active' : ''}`}
                                onClick={() => setActiveTab('custom')}
                            >{locale.status.customStatus}</button>
                        </div>

                        <div className="status-picker__content">
                            {activeTab === 'presets' ? (
                                <div className="status-picker__grid">
                                    {CONDITIONS.map(c => {
                                        const Icon = ICONS[c.defaultIcon];
                                        return (
                                            <button 
                                                key={c.id} 
                                                className="status-picker__preset-btn"
                                                onClick={() => handlePresetClick(c)}
                                                title={c.name}
                                                type="button"
                                            >
                                                <Icon className="status-picker__preset-icon" />
                                                <span className="status-picker__preset-label">{c.name}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="status-picker__custom-form">
                                    <input 
                                        type="text" 
                                        placeholder={locale.statusPicker.namePlaceholder}
                                        value={customName}
                                        onChange={e => setCustomName(e.target.value)}
                                        className="status-picker__input"
                                        autoFocus
                                    />
                                    <div className="status-picker__row">
                                        <label className="status-picker__label">{locale.status.duration}:</label>
                                        <input 
                                            type="number" 
                                            min="1" 
                                            value={customDuration}
                                            onChange={e => setCustomDuration(parseInt(e.target.value) || 1)}
                                            className="status-picker__input-sm"
                                        />
                                        <span className="status-picker__label">{locale.status.rounds}</span>
                                    </div>
                                    <div className="status-picker__section-label">{locale.statusPicker.iconLabel}</div>
                                    <div className="status-picker__icon-selector">
                                        <IconPicker selectedIcon={customIcon} onSelect={setCustomIcon} />
                                    </div>
                                    <button 
                                        onClick={handleCustomAdd} 
                                        disabled={!customName.trim()}
                                        className="status-picker__add-btn"
                                        type="button"
                                    >
                                        {locale.statusPicker.add}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};
