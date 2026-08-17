import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private http = inject(HttpClient);
  private readonly baseUrl = '/api/productos';

  listar(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.baseUrl);
  }

  listarTodos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.baseUrl}/todos`);
  }

  guardar(producto: Producto): Observable<Producto> {
    if (producto.idProducto) {
      return this.http.put<Producto>(`${this.baseUrl}/${producto.idProducto}`, producto);
    }
    return this.http.post<Producto>(this.baseUrl, producto);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // Actualiza SOLO el stock (para reponedores)
  actualizarStock(id: number, stock: number): Observable<Producto> {
    return this.http.patch<Producto>(`${this.baseUrl}/${id}/stock?stock=${stock}`, {});
  }
}
