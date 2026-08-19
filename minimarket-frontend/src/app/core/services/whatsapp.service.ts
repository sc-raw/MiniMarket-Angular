import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PedidoWhatsApp, DetalleVentaRequest } from '../models/models';

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

  /** Conteo de pedidos por estado — para badge en navbar */
  contarPorEstado(estado: string = 'PENDIENTE'): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.baseUrl}/pedidos/count?estado=${estado}`);
  }

  marcarEnProceso(id: number): Observable<PedidoWhatsApp> {
    return this.http.put<PedidoWhatsApp>(`${this.baseUrl}/pedidos/${id}/en-proceso`, {});
  }

  atender(id: number, respuesta: string): Observable<PedidoWhatsApp> {
    return this.http.put<PedidoWhatsApp>(
      `${this.baseUrl}/pedidos/${id}/atender?respuesta=${encodeURIComponent(respuesta)}`,
      {}
    );
  }

  /** Enviar mensaje libre del operador (no cierra el pedido) */
  enviarMensaje(id: number, texto: string): Observable<PedidoWhatsApp> {
    return this.http.post<PedidoWhatsApp>(
      `${this.baseUrl}/pedidos/${id}/enviar`,
      { texto }
    );
  }

  /** Convierte un pedido WhatsApp en una Venta PENDIENTE */
  convertirAVenta(id: number, payload: {
    clienteId: number;
    cajeroId: number;
    productos: DetalleVentaRequest[];
  }): Observable<{ mensaje: string; ventaId: number; total: number; estado: string }> {
    return this.http.post<any>(`${this.baseUrl}/pedidos/${id}/convertir-venta`, payload);
  }
}
