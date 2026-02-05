import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocale } from '../contexts/LocaleContext';
import { useStore } from '../contexts/StoreContext';
import type { Status } from '../models/types';

interface StatusEditMenuProps {
    status: Status;
    combatantId: string;
    anchorEl: HTMLElement | null;
    onClose: () => void;
}

export const StatusEditMenu = ({ status, combatantId, anchorEl, onClose }: StatusEditMenuProps) => {
    const { combatStore: store } = useStore();
    const locale = useLocale();
    const [duration, setDuration] = useState(status.duration);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const menuRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        if (anchorEl && menuRef.current) {
            const rect = anchorEl.getBoundingClientRect();
            const menuRect = menuRef.current.getBoundingClientRect();

            let left = rect.left + window.scrollX;
            const top = rect.bottom + window.scrollY;

            // Collision detection
            if (rect.left + menuRect.width > window.innerWidth) {
                left = (rect.right + window.scrollX) - menuRect.width;
            }
             
            if (left < 0) left = 0;

            // eslint-disable-next-line
            setPosition({ top, left });
        }
    }, [anchorEl]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node) && anchorEl && !anchorEl.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [anchorEl, onClose]);

    const handleRemove = () => {
        store.removeStatus(combatantId, status.id);
        onClose();
    };
    
    const handleDurationChange = (val: number) => {
        setDuration(val);
        store.updateStatus(combatantId, status.id, { duration: val });
    };

    return createPortal(
        <div 
            ref={menuRef}
            className="status-edit-menu"
            style={{ top: position.top, left: position.left }}
        >
            <div className="status-edit-menu__header">{status.name}</div>
            <div className="status-edit-menu__row">
                <label>{locale.statusEditMenu.durationLabel}</label>
                <input 
                    type="number" 
                    value={duration}
                    onChange={(e) => handleDurationChange(parseInt(e.target.value) || 0)}
                    className="status-edit-menu__input"
                />
            </div>
            <button onClick={handleRemove} className="status-edit-menu__remove-btn">
                {locale.status.remove}
            </button>
        </div>,
        document.body
    ) as unknown as React.ReactNode;
};
