import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class JwtDecoderHelper {

  constructor() { }

  getDecodedAccessToken(token: string): any {
    if (token != null && token != "" && token != undefined) {
      try {
        return jwtDecode(token);
      } catch (Error) {
        console.error('Error decoding token', Error);
        return null;
      }
    }
    return null;
  }
}
