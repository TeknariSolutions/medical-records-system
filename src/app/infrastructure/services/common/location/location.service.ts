import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  private baseUrl = 'https://api-colombia.com/api/v1';

  constructor(private http: HttpClient) {}

  getDepartments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/Department`);
  }

  getCitiesByDepartmentId(departmentId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/Department/${departmentId}/cities`);
  }
}
