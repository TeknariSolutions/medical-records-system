import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean | UrlTree {
    const token = localStorage.getItem('authToken'); // o como guardes la sesión

    if (token) {
      return true; // ✅ usuario autenticado
    } else {
      // 🔒 redirige al login si no hay sesión
      return this.router.createUrlTree(['/cermi/auth/login']);
    }
  }
}
