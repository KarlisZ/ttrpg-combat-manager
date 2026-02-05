import { observer } from 'mobx-react-lite';
import { useRef, useState } from 'react';
import { useStore } from '../contexts/StoreContext';
import type { Status } from '../models/types';
import { ICONS } from '../utils/icons';
import { StatusEditMenu } from './StatusEditMenu';

interface StatusPillProps {
    status: Status;
    combatantId: string;
}

export const StatusPill = observer(({ status, combatantId }: StatusPillProps) => {
    const { uiStore, combatStore } = useStore();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pillRef = useRef<HTMLButtonElement>(null);

    const Icon = ICONS[status.icon] || ICONS.sparkles;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const IconComponent = Icon as any;

    const isHovered = uiStore.hoveredStatusName === status.name;

    const handleMouseEnter = () => {
        uiStore.setHoveredStatusName(status.name);
    };

    const handleMouseLeave = () => {
        uiStore.setHoveredStatusName(null);
    };

    const sourceCombatant = status.sourceId ? combatStore.combatants.find(c => c.id === status.sourceId) : undefined;
    const sourceText = sourceCombatant ? `Source: ${sourceCombatant.name}` : '';

    return (
        <>
            <button
                ref={pillRef}
                className={`status-pill ${isHovered ? 'status-pill--highlight' : ''}`}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={() => setIsMenuOpen(true)}
                title={`${status.name} (${status.duration} rnds)${sourceText ? `\n${sourceText}` : ''}`}
                type="button"
            >
                <IconComponent className="status-pill__icon" />
            </button>
            {isMenuOpen && (
                 <StatusEditMenu 
                     status={status} 
                     combatantId={combatantId} 
                     anchorEl={pillRef.current} 
                     onClose={() => setIsMenuOpen(false)} 
                 />
            )}
        </>
    );
});
