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

// Roles disponibles en el sistema
export const ROLES = {
  ADMIN: 'ADMIN',
  CAJERO: 'CAJERO',
  REPONEDOR: 'REPONEDOR',
  ATENCION_CLIENTE: 'ATENCION_CLIENTE'
} as const;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private readonly baseUrl = '/api/auth';

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

  // ================= MÉTODOS POR ROL =================

  esAdmin(): boolean {
    return this.tieneRol(ROLES.ADMIN);
  }

  esCajero(): boolean {
    return this.tieneRol(ROLES.CAJERO);
  }

  esReponedor(): boolean {
    return this.tieneRol(ROLES.REPONEDOR);
  }

  esAtencionCliente(): boolean {
    return this.tieneRol(ROLES.ATENCION_CLIENTE);
  }

  // ================= PERMISOS ESPECÍFICOS =================

  // ¿Puede ver el módulo de clientes?
  puedeVerClientes(): boolean {
    return this.esAdmin() || this.esCajero() || this.esAtencionCliente();
  }

  // ¿Puede gestionar clientes (CRUD)?
  puedeGestionarClientes(): boolean {
    return this.puedeVerClientes();
  }

  // ¿Puede ver productos?
  puedeVerProductos(): boolean {
    return this.estaAutenticado();
  }

  // ¿Puede crear/editar/eliminar productos?
  puedeGestionarProductos(): boolean {
    return this.esAdmin();
  }

  // ¿Puede actualizar SOLO el stock de productos?
  puedeActualizarStock(): boolean {
    return this.esAdmin() || this.esReponedor();
  }

  // ¿Puede ver categorías?
  puedeVerCategorias(): boolean {
    return this.esAdmin() || this.esReponedor();
  }

  // ¿Puede gestionar categorías (CRUD)?
  puedeGestionarCategorias(): boolean {
    return this.esAdmin();
  }

  // ¿Puede gestionar empleados?
  puedeGestionarEmpleados(): boolean {
    return this.esAdmin();
  }

  // ¿Puede gestionar usuarios?
  puedeGestionarUsuarios(): boolean {
    return this.esAdmin();
  }

  // ¿Puede ver ventas?
  puedeVerVentas(): boolean {
    return this.esAdmin() || this.esCajero() || this.esAtencionCliente();
  }

  // ¿Puede crear ventas?
  puedeCrearVentas(): boolean {
    return this.esAdmin() || this.esCajero() || this.esAtencionCliente();
  }

  // ¿Puede ver reportes financieros (ventas, totales)?
  puedeVerReportesFinancieros(): boolean {
    return this.esAdmin() || this.esCajero() || this.esAtencionCliente();
  }

  // ¿Puede ver reportes de stock (vencidos, stock bajo)?
  puedeVerReportesStock(): boolean {
    return this.esAdmin() || this.esReponedor();
  }

  // ¿Puede ver TODOS los reportes?
  puedeVerTodosReportes(): boolean {
    return this.esAdmin();
  }
}
