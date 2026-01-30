export interface IStorageService {
  save(key: string, value: string): void;
  load(key: string): string | null;
  remove(key: string): void;
  clear(): void;
}

export class LocalStorageService implements IStorageService {
  public save(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error('LocalStorage save failed', e);
    }
  }

  public load(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  public remove(key: string): void {
    localStorage.removeItem(key);
  }

  public clear(): void {
    localStorage.clear();
  }
}

export class MemoryStorageService implements IStorageService {
  private storage = new Map<string, string>();

  public save(key: string, value: string): void {
    this.storage.set(key, value);
  }

  public load(key: string): string | null {
    return this.storage.get(key) || null;
  }

  public remove(key: string): void {
    this.storage.delete(key);
  }

  public clear(): void {
    this.storage.clear();
  }
}
