import { observer } from 'mobx-react-lite';
import { useRef, useState } from 'react';
import { useLocale } from '../contexts/LocaleContext';
import { useStore } from '../contexts/StoreContext';
import { FILE } from '../models/constants';
import { OptionsModal } from './OptionsModal';

export const CommandBar = observer(() => {
  const { combatStore: store } = useStore();
  const locale = useLocale();
  const fileInputRef = useRef<HTMLInputElement>(null);
const [shouldShowOptions, setShouldShowOptions] = useState(false);

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
        {store.tiedCombatantGroups.length > 0 && (
             <button 
                onClick={() => {
                    if (store.tieBreakerMode) {
                        store.autoResolveTies();
                        store.tieBreakerMode = false;
                    } else {
                        store.tieBreakerMode = true;
                    }
                }}
                className={store.tieBreakerMode ? 'command-bar__toggle--active' : undefined}
             >
                 {store.tieBreakerMode ? locale.tieBreaker.autoResolve : locale.commandBar.resolveTies}
             </button>
        )}
        <button onClick={() => store.newCombat()}>{locale.commandBar.newCombat}</button>
      </div>
      
      <div className="command-bar__group">
        <button 
          onClick={() => store.previousTurn()} 
          disabled={store.currentRound === 1 && store.activeCombatantId === (store.combatants[0]?.id ?? null)}
        >
           {locale.commandBar.previousTurn}
        </button>
        <button 
          onClick={() => store.nextTurn()}
          disabled={store.combatants.length === 0}
        >
           {locale.commandBar.nextTurn}
        </button>
      </div>

      <div className="command-bar__group">
        <button onClick={() => store.undo()} disabled={!store.canUndo}>{locale.commandBar.undo}</button>
        <button onClick={() => store.redo()} disabled={!store.canRedo}>{locale.commandBar.redo}</button>
        <button onClick={handleSave}>{locale.commandBar.save}</button>
        <button onClick={handleLoad}>{locale.commandBar.load}</button>
        <button onClick={() => setShouldShowOptions(true)}>{locale.commandBar.options}</button>
      </div>

      <input 
          type="file" 
          ref={fileInputRef} 
          className="command-bar__file-input"
          accept={FILE.EXT_JSON}
          onChange={handleFileChange} 
      />
      {shouldShowOptions && <OptionsModal onClose={() => setShouldShowOptions(false)} />}
    </header>
  );
});
