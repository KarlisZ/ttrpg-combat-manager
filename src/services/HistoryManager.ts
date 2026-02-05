import { makeAutoObservable } from 'mobx';

export interface IHistoryManager<T> {
  push(state: T): void;
  undo(): T | null;
  redo(): T | null;
  canUndo: boolean;
  canRedo: boolean;
  get historyLength(): number;
  get currentIndex(): number;
  get snapshot(): T[]; // For testing/debugging
}

export class HistoryManager<T> implements IHistoryManager<T> {
  private history: T[] = [];
  private index = -1;
  private readonly maxSize: number;

  public constructor(maxSize = 100) {
    makeAutoObservable(this);
    this.maxSize = maxSize;
  }

  public push(state: T): void {
    // If we are not at the end, truncate future
    if (this.index < this.history.length - 1) {
      this.history = this.history.slice(0, this.index + 1);
    }
    this.history.push(state);
    this.index = this.history.length - 1;

    if (this.history.length > this.maxSize) {
      this.history.shift();
      this.index--;
    }
  }

  public undo(): T | null {
    if (this.index > 0) {
      this.index--;
      return this.history[this.index];
    }
    return null;
  }

  public redo(): T | null {
    if (this.index < this.history.length - 1) {
      this.index++;
      return this.history[this.index];
    }
    return null;
  }

  public get canUndo(): boolean {
    return this.index > 0;
  }

  public get canRedo(): boolean {
    return this.index < this.history.length - 1;
  }

  public get historyLength(): number {
    return this.history.length;
  }

  public get currentIndex(): number {
    return this.index;
  }

  public get snapshot(): T[] {
    return [...this.history];
  }
}
