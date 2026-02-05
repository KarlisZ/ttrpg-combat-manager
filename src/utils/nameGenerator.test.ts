import { describe, it, expect } from 'vitest';
import { generateNextName } from './nameGenerator';

describe('generateNextName', () => {
  it('should return base name if unique', () => {
    expect(generateNextName('Monster', [])).toBe('Monster');
    expect(generateNextName('Monster', ['Goblin'])).toBe('Monster');
  });

  it('should append 1 if base name exists', () => {
    expect(generateNextName('Monster', ['Monster'])).toBe('Monster 1');
  });

  it('should find next available number in sequence starting from base', () => {
    expect(generateNextName('Monster', ['Monster', 'Monster 1'])).toBe('Monster 2');
    expect(generateNextName('Monster', ['Monster', 'Monster 1', 'Monster 2'])).toBe('Monster 3');
  });

  it('should fill gaps or append? (Implementation appends for consistency)', () => {
    // Current implementation searches loops 1..N
    // If we have Monster, Monster 2
    // Input 'Monster' -> Checks 'Monster 1' -> Free -> Returns 'Monster 1'
    expect(generateNextName('Monster', ['Monster', 'Monster 2'])).toBe('Monster 1');
  });

  it('should increment from existing number suffix', () => {
    expect(generateNextName('Monster 1', ['Monster 1'])).toBe('Monster 2');
    expect(generateNextName('Monster 5', ['Monster 5'])).toBe('Monster 6');
  });
  
  it('should handle complex names', () => {
      expect(generateNextName('Goblin King', ['Goblin King'])).toBe('Goblin King 1');
      expect(generateNextName('Unit 734', ['Unit 734'])).toBe('Unit 735');
  });

  it('should not be confused by partial matches', () => {
      // "Monster Elite" should not affect "Monster"
      expect(generateNextName('Monster', ['Monster Elite'])).toBe('Monster');
  });

  it('should handle user scenario: Monster -> Monster 1', () => {
      // "if we have a "Monster" the new name should offer "Monster 1" not Monster 2."
      expect(generateNextName('Monster', ['Monster'])).toBe('Monster 1');
  });

  it('should skip used numbers when incrementing suffix', () => {
    expect(generateNextName('Monster 1', ['Monster 1', 'Monster 2'])).toBe('Monster 3');
  });
});
