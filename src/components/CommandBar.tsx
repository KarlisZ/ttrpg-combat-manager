import { observer } from 'mobx-react-lite';
import { useRef, useState } from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { useLocale } from '../contexts/LocaleContext';
import { useStore } from '../contexts/StoreContext';
import { DEFAULTS, FILE } from '../models/constants';
import { OptionsModal } from './OptionsModal';
import { StatsModal } from './StatsModal';

export const CommandBar = observer(() => {
  const { combatStore: store } = useStore();
  const locale = useLocale();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [shouldShowOptions, setShouldShowOptions] = useState(false);
  const [shouldShowStats, setShouldShowStats] = useState(false);

  const handleSave = () => {
      const json = store.exportState();
      const blob = new Blob([json], { type: FILE.MIME_JSON });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `combat-state-${new Date().toISOString().split('T')[0]}${FILE.EXT_JSON}`;
      a.click();
      URL.revokeObjectURL(url);
  };

  const handleLoad = () => {
      fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
              const content = ev.target?.result as string;
              if (content) store.importState(content);
          };
          reader.readAsText(file);
      }
      e.target.value = '';
  };

  return (
    <header className="command-bar">
      <div className="command-bar__group">
        <button 
            onClick={() => store.newCombat()}
            disabled={store.combatants.length === 0 || (store.currentRound === DEFAULTS.STARTING_ROUND && !store.activeCombatantId)}
        >
            {locale.commandBar.newCombat}
        </button>
      </div>
      
      <div className="command-bar__group">
        <button 
          onClick={() => store.previousTurn()} 
          disabled={store.currentRound === DEFAULTS.STARTING_ROUND && (!store.activeCombatantId || store.activeCombatantId === store.turnOrder[0]?.id)}
        >
           <span style={{ fontSize: '0.75rem', marginRight: '0.5ch', opacity: 0.8 }}>{locale.commandBar.turnLabel}</span>
           {locale.commandBar.previousTurn}
        </button>
        <button 
          onClick={() => store.nextTurn()}
          disabled={store.combatants.length === 0}
        >
           <span style={{ fontSize: '0.75rem', marginRight: '0.5ch', opacity: 0.8 }}>{locale.commandBar.turnLabel}</span>
           {locale.commandBar.nextTurn}
        </button>
      </div>

      <div className="command-bar__group">
        <button onClick={() => store.undo()} disabled={!store.canUndo}>{locale.commandBar.undo}</button>
        <button onClick={() => store.redo()} disabled={!store.canRedo}>{locale.commandBar.redo}</button>
        <button onClick={handleSave} disabled={store.combatants.length === 0}>{locale.commandBar.save}</button>
        <button onClick={handleLoad}>{locale.commandBar.load}</button>
        <button onClick={() => setShouldShowOptions(true)}>{locale.commandBar.options}</button>
        <button onClick={() => setShouldShowStats(true)} title="Statistics" aria-label="Statistics" className="icon-btn">
            <InformationCircleIcon style={{ width: '1.25rem', height: '1.25rem' }} />
        </button>
      </div>

      <input 
          type="file" 
          ref={fileInputRef} 
          className="command-bar__file-input"
          accept={FILE.EXT_JSON}
          onChange={handleFileChange} 
      />
      {shouldShowOptions && <OptionsModal onClose={() => setShouldShowOptions(false)} />}
      {shouldShowStats && <StatsModal onClose={() => setShouldShowStats(false)} />}
    </header>
  );
});
