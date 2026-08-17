import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Reponedor } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ReponedorService {
  private http = inject(HttpClient);
  private readonly baseUrl = '/api/reponedores';

  listar(): Observable<Reponedor[]> {
    return this.http.get<Reponedor[]>(this.baseUrl);
  }

  listarTodos(): Observable<Reponedor[]> {
    return this.http.get<Reponedor[]>(`${this.baseUrl}/todos`);
  }

  guardar(reponedor: Reponedor): Observable<Reponedor> {
    if (reponedor.id) {
      return this.http.put(`${this.baseUrl}/${reponedor.id}`, reponedor).pipe(
        map((res: any) => (res && res.id ? res : reponedor))
      );
    }
    return this.http.post<Reponedor>(this.baseUrl, reponedor);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
