import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataTransferService {
  private dataSubject = new BehaviorSubject<any>(null);

  setData(data: any): void {
    this.dataSubject.next(data);
  }

  getData$(): Observable<any> {
    return this.dataSubject.asObservable();
  }

  clearData(): void {
    this.dataSubject.next(null);
  }
}
