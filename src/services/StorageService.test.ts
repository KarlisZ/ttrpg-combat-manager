import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LocalStorageService, MemoryStorageService } from './StorageService';

describe('LocalStorageService', () => {
    let service: LocalStorageService;
    
    beforeEach(() => {
        service = new LocalStorageService();
        vi.spyOn(Storage.prototype, 'setItem');
        vi.spyOn(Storage.prototype, 'getItem');
        vi.spyOn(Storage.prototype, 'removeItem');
        vi.spyOn(Storage.prototype, 'clear');
    });

    afterEach(() => {
        vi.restoreAllMocks();
        localStorage.clear();
    });

    it('should save to localStorage', () => {
        service.save('key', 'value');
        expect(localStorage.setItem).toHaveBeenCalledWith('key', 'value');
    });

    it('should load from localStorage', () => {
        localStorage.setItem('key', 'value');
        const value = service.load('key');
        expect(value).toBe('value');
        expect(localStorage.getItem).toHaveBeenCalledWith('key');
    });

    it('should return null if key not found', () => {
        const value = service.load('missing');
        expect(value).toBeNull();
    });

    it('should return null when load throws error', () => {
        vi.spyOn(Storage.prototype, 'getItem').mockImplementationOnce(() => { throw new Error('Fail'); });
        const value = service.load('key');
        expect(value).toBeNull();
    });

    it('should remove from localStorage', () => {
        localStorage.setItem('key', 'value');
        service.remove('key');
        expect(localStorage.removeItem).toHaveBeenCalledWith('key');
        expect(service.load('key')).toBeNull();
    });

    it('should clear localStorage', () => {
        localStorage.setItem('key', 'value');
        service.clear();
        expect(localStorage.clear).toHaveBeenCalled();
        expect(service.load('key')).toBeNull();
    });

    it('should handle save errors gracefully', () => {
        vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
            throw new Error('QuotaExceeded');
        });
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        
        service.save('key', 'value');
        
        expect(consoleSpy).toHaveBeenCalled();
    });
});

describe('MemoryStorageService', () => {
    let service: MemoryStorageService;

    beforeEach(() => {
        service = new MemoryStorageService();
    });

    it('should save and load', () => {
        service.save('key', 'value');
        expect(service.load('key')).toBe('value');
    });

    it('should return null for missing key', () => {
        expect(service.load('missing')).toBeNull();
    });

    it('should remove', () => {
        service.save('key', 'value');
        service.remove('key');
        expect(service.load('key')).toBeNull();
    });
    
    it('should clear', () => {
        service.save('key', 'value');
        service.clear();
        expect(service.load('key')).toBeNull();
    });
});
