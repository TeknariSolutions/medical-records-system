// src/app/config.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, firstValueFrom, map, Observable, tap } from 'rxjs';
import { AppConfig } from 'src/app/core/models/app-config.model';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  private configUrl = 'assets/config.json';

  constructor(private http: HttpClient) { }


  getConfig(): Observable<AppConfig> {
    return this.http.get<AppConfig>(this.configUrl).pipe(
      catchError(error => {
        console.error('Error loading config:', error);
        throw error;
      })
    );
  }


  getUrl(): Observable<string> {
    return this.getConfig().pipe(
      map(config => config.API_URL)
    );
  }

}
