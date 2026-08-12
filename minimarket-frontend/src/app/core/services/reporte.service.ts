import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ResumenReporte {
  totalVentasFinalizadas: number;
  cantidadVentas: number;
  cantidadProductos: number;
  cantidadStockBajo: number;
}

@Injectable({ providedIn: 'root' })
export class ReporteService {
  private http = inject(HttpClient);
  private readonly baseUrl = '/api/reportes';

  resumen(): Observable<ResumenReporte> {
    return this.http.get<ResumenReporte>(`${this.baseUrl}/resumen`);
  }

  ventasPorEstado(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/ventas-por-estado`);
  }

  topClientes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/top-clientes`);
  }

  topProductos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/top-productos`);
  }

  stockBajo(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/stock-bajo`);
  }
}
