import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Venta, CrearVentaRequest } from '../models/models';

@Injectable({ providedIn: 'root' })
export class VentaService {
  private http = inject(HttpClient);
  private readonly baseUrl = '/api/ventas';

  listar(): Observable<Venta[]> {
    return this.http.get<Venta[]>(this.baseUrl);
  }

  buscarPorId(id: number): Observable<Venta> {
    return this.http.get<Venta>(`${this.baseUrl}/${id}`);
  }

  crear(request: CrearVentaRequest): Observable<Venta> {
    return this.http.post<Venta>(this.baseUrl, request);
  }

  actualizarEstado(id: number, estado: string): Observable<Venta> {
    return this.http.put<Venta>(`${this.baseUrl}/${id}/estado?estado=${estado}`, {});
  }

  eliminar(id: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' });
  }
}
