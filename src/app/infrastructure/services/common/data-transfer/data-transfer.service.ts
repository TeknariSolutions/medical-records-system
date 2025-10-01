import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DataTransferService {
  private storage: Record<string, any> = {};

  setData(key: string, value: any): void {
    this.storage[key] = value;
  }

  getData<T>(key: string): T | null {
    return this.storage[key] ?? null;
  }

  clearData(key: string): void {
    delete this.storage[key];
  }
}
