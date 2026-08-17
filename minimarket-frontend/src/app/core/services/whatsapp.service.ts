import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PedidoWhatsApp } from '../models/models';

@Injectable({ providedIn: 'root' })
export class WhatsAppService {
  private http = inject(HttpClient);
  private readonly baseUrl = '/api/whatsapp';

  listarTodos(): Observable<PedidoWhatsApp[]> {
    return this.http.get<PedidoWhatsApp[]>(`${this.baseUrl}/pedidos`);
  }

  listarPendientes(): Observable<PedidoWhatsApp[]> {
    return this.http.get<PedidoWhatsApp[]>(`${this.baseUrl}/pedidos/pendientes`);
  }

  listarPorTipo(tipo: string): Observable<PedidoWhatsApp[]> {
    return this.http.get<PedidoWhatsApp[]>(`${this.baseUrl}/pedidos/tipo/${tipo}`);
  }

  marcarEnProceso(id: number): Observable<PedidoWhatsApp> {
    return this.http.put<PedidoWhatsApp>(`${this.baseUrl}/pedidos/${id}/en-proceso`, {});
  }

  atender(id: number, respuesta: string): Observable<PedidoWhatsApp> {
    return this.http.put<PedidoWhatsApp>(`${this.baseUrl}/pedidos/${id}/atender?respuesta=${encodeURIComponent(respuesta)}`, {});
  }
}
