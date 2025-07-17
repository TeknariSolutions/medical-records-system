import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataTransferService {
  private dataSubject = new BehaviorSubject<any>(null);


  setData(data: any): void {
    this.dataSubject.next(data);
    sessionStorage.setItem('patientData', JSON.stringify(data));
  }


  getData$(): Observable<any> {
    return this.dataSubject.asObservable();
  }

  clearData(): void {
    this.dataSubject.next(null);
  }

  loadFromStorage(): void {
    const saved = sessionStorage.getItem('patientData');
    if (saved) {
      this.dataSubject.next(JSON.parse(saved));
    }
  }
}
