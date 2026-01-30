import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { useLocale } from '../contexts/LocaleContext';
import { useStore } from '../contexts/StoreContext';
import { CombatantType } from '../models/constants';

export const SpawnControls = observer(() => {
  const { combatStore: store } = useStore();
  const locale = useLocale();
  const [heroName, setHeroName] = useState('');
  const [heroInit, setHeroInit] = useState('0');
  const [monsterName, setMonsterName] = useState('');
  const [monsterHp, setMonsterHp] = useState('');
  const [monsterInitMod, setMonsterInitMod] = useState('0');
  const [monsterCount, setMonsterCount] = useState('1');

  const addHero = (e: React.FormEvent) => {
    e.preventDefault();
    
    let name = heroName.trim();
    if (!name) {
        const heroCount = store.combatants.filter(c => c.type === CombatantType.HERO).length;
        name = `Hero ${heroCount + 1}`;
    }
    
    store.spawnHero(name, parseInt(heroInit) || 0);
    setHeroName('');
    setHeroInit('0');
  };

  const addMonster = (e: React.FormEvent) => {
    e.preventDefault();
    if (!monsterName.trim()) return;

    store.spawnMonster(
        monsterName, 
        parseInt(monsterHp) || 10, 
        parseInt(monsterInitMod) || 0,
        parseInt(monsterCount) || 1
    );

    setMonsterName('');
  }

  return (
    <footer className="spawn-controls">
      <form onSubmit={addHero} className="spawn-controls__form">
        <strong>{locale.spawnControls.spawnHero}</strong>
        <input 
          aria-label={locale.spawnControls.heroNamePlaceholder}
          placeholder={locale.spawnControls.heroNamePlaceholder}
          value={heroName}
          onChange={e => setHeroName(e.target.value)}
        />
        <input 
          aria-label={locale.spawnControls.heroInitPlaceholder}
          placeholder={locale.spawnControls.heroInitPlaceholder}
          type="number"
          value={heroInit}
          onChange={e => setHeroInit(e.target.value)}
          className="spawn-controls__input-xs"
        />
        <button type="submit">{locale.spawnControls.add}</button>
      </form>

      <form onSubmit={addMonster} className="spawn-controls__form">
        <strong>{locale.spawnControls.spawnMonster}</strong>
        <input 
          aria-label={locale.spawnControls.monsterNamePlaceholder}
          placeholder={locale.spawnControls.monsterNamePlaceholder}
          value={monsterName}
          onChange={e => setMonsterName(e.target.value)}
        />
        <input 
          aria-label={locale.spawnControls.hpPlaceholder}
          placeholder={locale.spawnControls.hpPlaceholder}
          type="number"
          value={monsterHp}
          onChange={e => setMonsterHp(e.target.value)}
          className="spawn-controls__input-xs"
        />
        <input 
          aria-label={locale.spawnControls.initModPlaceholder}
          placeholder={locale.spawnControls.initModPlaceholder}
          type="number"
          value={monsterInitMod}
          onChange={e => setMonsterInitMod(e.target.value)}
          className="spawn-controls__input-xs"
        />
        <input 
          aria-label={locale.spawnControls.countPlaceholder}
          placeholder={locale.spawnControls.countPlaceholder}
          type="number"
          min="1"
          value={monsterCount}
          onChange={e => setMonsterCount(e.target.value)}
          className="spawn-controls__input-xs"
        />
        <button type="submit">{locale.spawnControls.add}</button>
      </form>
    </footer>
  );
});
