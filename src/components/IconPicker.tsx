import type { IconName } from '../utils/icons';
import { ICON_NAMES,ICONS } from '../utils/icons';

interface IconPickerProps {
    selectedIcon: IconName;
    onSelect: (icon: IconName) => void;
}

export const IconPicker = ({ selectedIcon, onSelect }: IconPickerProps) => {
    return (
        <div className="icon-picker">
            {ICON_NAMES.map((name) => {
                const Icon = ICONS[name];
                const isSelected = selectedIcon === name;
                return (
                    <button
                        key={name}
                        type="button"
                        onClick={() => onSelect(name)}
                        className={`icon-picker__option ${isSelected ? 'icon-picker__option--selected' : ''}`}
                        aria-pressed={isSelected}
                        aria-label={`Select ${name} icon`}
                        title={name}
                    >
                        <Icon />
                    </button>
                );
            })}
        </div>
    );
};
