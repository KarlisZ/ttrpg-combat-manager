import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { useLocale } from '../contexts/LocaleContext';
import { useStore } from '../contexts/StoreContext';
import { generateNextName } from '../utils/nameGenerator';

export const SpawnControls = observer(() => {
  const { combatStore: store } = useStore();
  const locale = useLocale();

  // Helper to suggest the next name based on current combatants
  const suggestNextName = (baseName: string) => {
    return generateNextName(baseName, store.combatants.map(c => c.name));
  };

  const [heroName, setHeroName] = useState(locale.spawnControls.heroNameDefault);
  const [heroInit, setHeroInit] = useState('0');
  const [monsterName, setMonsterName] = useState(locale.spawnControls.monsterNameDefault);
  const [monsterHp, setMonsterHp] = useState('10');
  const [monsterInitMod, setMonsterInitMod] = useState('0');
  const [monsterCount, setMonsterCount] = useState('1');

  const addHero = (e: React.FormEvent) => {
    e.preventDefault();
    
    let name = heroName.trim();
    if (!name) {
        name = suggestNextName(locale.spawnControls.heroNameDefault);
    }
    
    store.spawnHero(name, parseInt(heroInit) || 0);
    // Suggest next name based on what we just added
    setHeroName(suggestNextName(name));
    setHeroInit('0');
  };

  const addMonster = (e: React.FormEvent) => {
    e.preventDefault();
    const nameToAdd = monsterName.trim();
    if (!nameToAdd) return;

    store.spawnMonster(
        nameToAdd, 
        parseInt(monsterHp) || 10, 
        parseInt(monsterInitMod) || 0,
        parseInt(monsterCount) || 1
    );

    // Suggest next name based on what we just added
    setMonsterName(suggestNextName(nameToAdd));
  }

  return (
    <footer className="spawn-controls">
      <h2 className="spawn-controls__title">{locale.spawnControls.title}</h2>
      <form onSubmit={addHero} className="spawn-controls__form">
        <div className="spawn-controls__group">
          <input 
            id="hero-name"
            placeholder=" "
            value={heroName}
            onChange={e => setHeroName(e.target.value)}
          />
          <label htmlFor="hero-name">{locale.spawnControls.heroNamePlaceholder}</label>
        </div>
        <div className="spawn-controls__group">
          <input 
            id="hero-init"
            placeholder=" "
            type="number"
            value={heroInit}
            onChange={e => setHeroInit(e.target.value)}
            className="spawn-controls__input-xs"
          />
          <label htmlFor="hero-init">{locale.spawnControls.initLabel}</label>
        </div>
        <button type="submit">{locale.spawnControls.add}</button>
      </form>

      <hr className="spawn-controls__separator" />

      <form onSubmit={addMonster} className="spawn-controls__form">
        <div className="spawn-controls__group">
          <input 
            id="monster-name"
            placeholder=" "
            value={monsterName}
            onChange={e => setMonsterName(e.target.value)}
          />
          <label htmlFor="monster-name">{locale.spawnControls.monsterNamePlaceholder}</label>
        </div>
        <div className="spawn-controls__group">
          <input 
            id="monster-hp"
            placeholder=" "
            type="number"
            value={monsterHp}
            onChange={e => setMonsterHp(e.target.value)}
            className="spawn-controls__input-xs"
          />
          <label htmlFor="monster-hp">{locale.spawnControls.hpLabel}</label>
        </div>
        <div className="spawn-controls__group">
          <input 
            id="monster-init"
            placeholder=" "
            type="number"
            value={monsterInitMod}
            onChange={e => setMonsterInitMod(e.target.value)}
            className="spawn-controls__input-xs"
          />
          <label htmlFor="monster-init">{locale.spawnControls.initModLabel}</label>
        </div>
        <div className="spawn-controls__group">
          <input 
            id="monster-count"
            placeholder=" "
            type="number"
            min="1"
            value={monsterCount}
            onChange={e => setMonsterCount(e.target.value)}
            className="spawn-controls__input-xs"
          />
          <label htmlFor="monster-count">{locale.spawnControls.countLabel}</label>
        </div>
        <button type="submit">{locale.spawnControls.add}</button>
      </form>
    </footer>
  );
});
