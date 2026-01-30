import type { ReactNode } from 'react';
import { LandscapeWarning } from './LandscapeWarning';

export const Layout = ({ 
  children,
  header,
  controls,
  footer 
}: { 
  children: ReactNode;
  header: ReactNode;
  controls?: ReactNode;
  footer?: ReactNode;
}) => {
  return (
    <div className="layout-root">
      {header}
      <main className="layout-main">
        {children}
      </main>
      {controls && (
          <div className="layout-controls">
              {controls}
          </div>
      )}
      {footer}
      <LandscapeWarning />
    </div>
  );
};
