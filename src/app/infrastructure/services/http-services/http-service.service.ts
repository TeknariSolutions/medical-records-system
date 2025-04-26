import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { IHttpService } from 'src/app/core/interfaces/http-services/Ihttp.service';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';
import { ResponseDTO } from 'src/app/core/DTOs/common/response/response.dto';
//import { DmsNotificationsService } from 'dms-front-core/infrastructure/services/notifications';
//import { NotificationType } from 'dms-front-core/core/enums';

@Injectable({
  providedIn: 'root',
})
export class HttpService implements IHttpService {
  //_notificationType = NotificationType;

  constructor(
    private httpClient: HttpClient,
    private _router: Router,
    //private _notificationsService: DmsNotificationsService
  ) {}

  private addJwtTokenHeader(): HttpHeaders {
    const token = localStorage.getItem('authToken');

    if (!token) {
      return new HttpHeaders();
    }

    try {
      const decoded: any = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      if (decoded.exp < currentTime) {
        localStorage.clear();
        this._router.navigate(['auth/login']);
      }

      return new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });
    } catch (error) {
      return new HttpHeaders();
    }
  }

  private handleError(error: any): Observable<never> {
   /*  this._notificationsService.openNotification({
      type: this._notificationType.ERROR,
      title: 'Error al Ejecutar el Endpoint',
    }); */
    throw error;
  } 

  private buildUrl(urlServie: string, endpoint: string, params?: any): string {
    let url = `${urlServie}/${endpoint}`;
    if (params && typeof params === 'object') {
      const isSingleValue = !(params.constructor === Object);
      const queryParams = new HttpParams({
        fromObject: isSingleValue ? { value: params } : params,
      });
      url += `?${queryParams.toString()}`;
    }
    return url;
  }

  private performHttpRequest<T>(
    urlServie: string,
    method: 'get' | 'post' | 'put' | 'delete',
    endpoint: string,
    params?: any,
    body?: any
  ): Observable<T> {
    return new Observable<T>((observer) => {
      const url = this.buildUrl(urlServie, endpoint, params);
      let httpCall: Observable<T>;

      switch (method) {
        case 'get':
          httpCall = this.httpClient.get<T>(url, {
            headers: this.addJwtTokenHeader(),
          });
          break;
        case 'post':
          httpCall = this.httpClient.post<T>(url, body, {
            headers: this.addJwtTokenHeader(),
          });
          break;
        case 'put':
          httpCall = this.httpClient.put<T>(url, body, {
            headers: this.addJwtTokenHeader(),
          });
          break;
        case 'delete':
          httpCall = this.httpClient.delete<T>(url, {
            headers: this.addJwtTokenHeader(),
          });
          break;
      }

      httpCall
        .pipe(catchError(this.handleError.bind(this)))
        .subscribe({
          next: (response) => observer.next(response),
          error: (err) => observer.error(err),
          complete: () => observer.complete(),
        });
    });
  }

  get<T>(urlServie: string, endpoint: string, params?: any): Observable<T> {
    return this.performHttpRequest<T>(urlServie, 'get', endpoint, params);
  }

  post(
    urlServie: string,
    endpoint: string,
    params?: any,
    body?: any
  ): Observable<ResponseDTO> {
    return this.performHttpRequest<ResponseDTO>(
      urlServie,
      'post',
      endpoint,
      params,
      body
    );
  }

  put(
    urlServie: string,
    endpoint: string,
    params?: any,
    body?: any
  ): Observable<ResponseDTO> {
    return this.performHttpRequest<ResponseDTO>(
      urlServie,
      'put',
      endpoint,
      params,
      body
    );
  }

  delete(
    urlServie: string,
    endpoint: string,
    params?: any
  ): Observable<ResponseDTO> {
    return this.performHttpRequest<ResponseDTO>(
      urlServie,
      'delete',
      endpoint,
      params
    );
  }
}
