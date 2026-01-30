import { describe, it, expect, beforeEach } from 'vitest';
import { HistoryManager } from './HistoryManager';

describe('HistoryManager', () => {
    let history: HistoryManager<string>;

    beforeEach(() => {
        history = new HistoryManager<string>(5); // Small size for testing
    });

    it('should push state', () => {
        history.push('1');
        expect(history.historyLength).toBe(1);
        expect(history.currentIndex).toBe(0);
    });

    it('should undo and redo', () => {
        history.push('1');
        history.push('2');
        
        expect(history.undo()).toBe('1');
        expect(history.currentIndex).toBe(0);
        
        expect(history.redo()).toBe('2');
        expect(history.currentIndex).toBe(1);
    });

    it('should truncate future on push', () => {
        history.push('1');
        history.push('2');
        history.undo(); // back to '1'
        history.push('3');
        
        expect(history.historyLength).toBe(2); // '1', '3'
        expect(history.undo()).toBe('1');
        expect(history.redo()).toBe('3');
    });

    it('should respect max size', () => {
        history = new HistoryManager(2);
        history.push('1');
        history.push('2');
        history.push('3');
        
        expect(history.historyLength).toBe(2);
        // Should have '2', '3'
        expect(history.undo()).toBe('2');
        expect(history.undo()).toBeNull(); // Start of history
    });

    it('should return null if cannot undo/redo', () => {
        expect(history.undo()).toBeNull();
        expect(history.redo()).toBeNull();
        
        history.push('1');
        expect(history.undo()).toBeNull(); // Only one item
    });

    it('should expose snapshot', () => {
        history.push('1');
        expect(history.snapshot).toEqual(['1']);
    });
});
