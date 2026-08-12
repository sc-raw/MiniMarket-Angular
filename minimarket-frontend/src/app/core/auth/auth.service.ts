import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  username: string;
  rol: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private readonly baseUrl = '/api/auth';

  // Estado reactivo del usuario autenticado
  usuarioActual = signal<LoginResponse | null>(this.leerSesion());

  private leerSesion(): LoginResponse | null {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('minimarket_user') : null;
    return raw ? JSON.parse(raw) as LoginResponse : null;
  }

  login(creds: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.baseUrl + '/login', creds).pipe(
      tap(res => {
        if (res.success) {
          localStorage.setItem('minimarket_user', JSON.stringify(res));
          this.usuarioActual.set(res);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('minimarket_user');
    this.usuarioActual.set(null);
  }

  estaAutenticado(): boolean {
    return this.usuarioActual() !== null;
  }

  tieneRol(rol: string): boolean {
    const u = this.usuarioActual();
    return u !== null && u.rol === rol;
  }
}
