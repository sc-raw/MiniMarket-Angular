import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cliente, Venta } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private http = inject(HttpClient);
  private readonly baseUrl = '/api/clientes';

  listar(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.baseUrl);
  }

  // 🔥 Devuelve las últimas 5 ventas del cliente (su "cuenta")
  ultimasVentas(id: number): Observable<Venta[]> {
    return this.http.get<Venta[]>(`${this.baseUrl}/${id}/ultimas-ventas`);
  }

  guardar(cliente: Cliente): Observable<Cliente> {
    if (cliente.id) {
      return this.http.put<Cliente>(`${this.baseUrl}/${cliente.id}`, cliente);
    }
    return this.http.post<Cliente>(this.baseUrl, cliente);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
