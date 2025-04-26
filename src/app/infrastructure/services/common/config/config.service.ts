// src/app/config.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, firstValueFrom, map, Observable, tap } from 'rxjs';
import { AppConfig } from 'src/app/core/models/app-config.model';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  //private config: AppConfig | null = null;

  private configUrl = 'assets/config.json';

  constructor(private http: HttpClient) {}
/* 
  async loadConfig(): Promise<void> {
    this.config = await firstValueFrom(this.http.get<AppConfig>('assets/config.json'));
  }

  getApiUrl(apiName?: 'test' | 'prod'): string {
    if (!this.config) return '';
    return apiName ? this.config.apiUrls[apiName] || '' : this.config.apiUrl;
  }

  get featureFlag(): boolean {
    return this.config?.featureFlag ?? false;
  } */


    getConfig(): Observable<AppConfig> {
      return this.http.get<AppConfig>(this.configUrl).pipe(
          tap(config => console.log('Config loaded:', config)),
          catchError(error => {
              console.error('Error loading config:', error);
              throw error;
          })
      );
  }

  getUrl(): Observable<string> {
 /*    return this.getConfig().pipe(
        map(config => {
            const url = config[key];
            if (!url) {
                throw new Error(`URL for key ${key} not found in config`);
            }
            return url;
        })
    ); */


    return this.getConfig().pipe(
      map(config => config.API_URL)
    );
  }

}
