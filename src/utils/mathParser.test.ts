import { describe, it, expect } from 'vitest';
import { parseMathExpression } from './mathParser';

describe('mathParser', () => {
  it('should parse simple integers', () => {
    expect(parseMathExpression('5')).toBe(5);
    expect(parseMathExpression('-5')).toBe(-5);
    expect(parseMathExpression('+5')).toBe(5);
  });

  it('should parse addition and subtraction', () => {
    expect(parseMathExpression('5+5')).toBe(10);
    expect(parseMathExpression('10-5')).toBe(5);
    expect(parseMathExpression('-5+5')).toBe(0);
    expect(parseMathExpression('5-10')).toBe(-5);
  });

  it('should handle complex expressions', () => {
      expect(parseMathExpression('1+2-3+4')).toBe(4);
      expect(parseMathExpression('-1-1-1')).toBe(-3);
  });

  it('should ignore whitespace', () => {
      expect(parseMathExpression(' 5 + 5 ')).toBe(10);
  });

  it('should ignore invalid characters', () => {
      expect(parseMathExpression('5a+5')).toBe(10);
      expect(parseMathExpression('5 + 5!')).toBe(10);
  });
  
  it('should return 0 for empty or invalid input', () => {
      expect(parseMathExpression('')).toBe(0);
      expect(parseMathExpression('abc')).toBe(0);
      expect(parseMathExpression('++')).toBe(0); // This might need check logic
  });

  it('should treat comma separated or space separated numbers as additive terms', () => {
    expect(parseMathExpression('5, 2')).toBe(7);
    expect(parseMathExpression('5 2')).toBe(7);
    expect(parseMathExpression('5, -2')).toBe(3);
  });
});
