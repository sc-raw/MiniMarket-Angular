import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Categoria } from '../models/models';

@Injectable({ providedIn: 'root' })
export class CategoriaService {
  private http = inject(HttpClient);
  private readonly baseUrl = '/api/categorias';

  listar(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.baseUrl);
  }

  guardar(categoria: Categoria): Observable<Categoria> {
    if (categoria.idCategoria) {
      // PUT: a veces el body viene vacío o raro → no forzamos el tipo estricto
      return this.http.put(
        `${this.baseUrl}/${categoria.idCategoria}`,
        categoria
      ).pipe(
        map((res: any) => (res && res.idCategoria ? res : categoria))
      );
    }
    return this.http.post<Categoria>(this.baseUrl, categoria);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}