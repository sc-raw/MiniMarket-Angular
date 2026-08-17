import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Cajero } from '../models/models';

@Injectable({ providedIn: 'root' })
export class CajeroService {
  private http = inject(HttpClient);
  private readonly baseUrl = '/api/cajeros';

  listar(): Observable<Cajero[]> {
    return this.http.get<Cajero[]>(this.baseUrl);
  }

  listarTodos(): Observable<Cajero[]> {
  return this.http.get<Cajero[]>(`${this.baseUrl}/todos`);
  }

  guardar(cajero: Cajero): Observable<Cajero> {
    if (cajero.id) {
      return this.http.put(`${this.baseUrl}/${cajero.id}`, cajero).pipe(
        map((res: any) => (res && res.id ? res : cajero))
      );
    }
    return this.http.post<Cajero>(this.baseUrl, cajero);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}