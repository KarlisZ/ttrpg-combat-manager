import { createContext, type ReactNode,useContext, useState } from 'react';
import en from '../locales/en.json';

export type Locale = typeof en;

const LocaleContext = createContext<Locale>(en);

export const LocaleProvider = ({ children }: { children: ReactNode }) => {
  // In a full app, this state would switch between languages
  const [locale] = useState<Locale>(en);

  return (
    <LocaleContext.Provider value={locale}>
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = () => {
  const locale = useContext(LocaleContext);
  if (!locale) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return locale;
};
