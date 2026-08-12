import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cajero } from '../models/models';

@Injectable({ providedIn: 'root' })
export class CajeroService {
  private http = inject(HttpClient);
  private readonly baseUrl = '/api/cajeros';

  listar(): Observable<Cajero[]> {
    return this.http.get<Cajero[]>(this.baseUrl);
  }
}
