import { describe, it, expect } from 'vitest';
import { ICONS, ICON_NAMES } from './icons';

describe('Icons', () => {
  it('should export an object of icons', () => {
    expect(ICONS).toBeDefined();
    expect(Object.keys(ICONS).length).toBeGreaterThan(0);
  });

  it('should match ICON_NAMES keys', () => {
    expect(ICON_NAMES).toEqual(Object.keys(ICONS));
  });

  it('should have valid components for all icons', () => {
    ICON_NAMES.forEach(name => {
      expect(ICONS[name]).toBeDefined();
    });
  });
});
