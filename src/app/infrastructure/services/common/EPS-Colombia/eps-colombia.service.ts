import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Eps {
  nombre: string;
  codigo: string;
  codigo_movilidad: string;
  nit: string;
  regimen: string;
}

@Injectable({
  providedIn: 'root'
})
export class EpsColombiaService {

  private epsUrl = 'assets/eps-colombia/eps-colombia.json';

  constructor(private http: HttpClient) { }

  getEpsList(): Observable<Eps[]> {
    return this.http.get<Eps[]>(this.epsUrl);
  }
}
