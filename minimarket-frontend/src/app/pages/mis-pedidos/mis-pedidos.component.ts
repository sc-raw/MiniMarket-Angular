import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-mis-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container mt-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="mb-0">📦 Mis Pedidos</h2>
        <a routerLink="/tienda" class="btn btn-outline-success">🛒 Volver a la tienda</a>
      </div>

      <div class="input-group mb-4">
        <input type="text" class="form-control" placeholder="Ingresa tu DNI para ver tus pedidos"
               [(ngModel)]="dni" (keyup.enter)="buscar()" maxlength="8">
        <button class="btn btn-success" (click)="buscar()">Buscar</button>
      </div>

      @if (error()) {
        <div class="alert alert-danger">{{ error() }}</div>
      }

      @if (pedidos().length > 0) {
        <div class="row">
          @for (p of pedidos(); track p.id) {
            <div class="col-md-6 mb-3">
              <div class="card shadow-sm h-100">
                <div class="card-header d-flex justify-content-between align-items-center">
                  <strong>Pedido #{{ p.id }}</strong>
                  <span class="badge bg-success">{{ p.estado }}</span>
                </div>
                <div class="card-body">
                  <p class="mb-1">Fecha: {{ p.fechaRegistro | date:'medium' }}</p>
                  <h5 class="text-success mb-0">Total: S/. {{ p.total }}</h5>
                </div>
              </div>
            </div>
          }
        </div>
      } @else if (busco()) {
        <div class="alert alert-info">No tienes pedidos registrados con este DNI.</div>
      }
    </div>
  `
})
export class MisPedidosComponent {
  private http = inject(HttpClient);
  dni = '';
  busco = signal(false);
  error = signal('');
  pedidos = signal<any[]>([]);

  buscar() {
    if (!this.dni.trim()) return;
    this.busco.set(true);
    this.error.set('');
    this.http.get<any[]>(`/api/ventas/cliente/${this.dni}`).subscribe({
      next: (data) => this.pedidos.set(data ?? []),
      error: () => {
        this.pedidos.set([]);
        this.error.set('Error al consultar tus pedidos.');
      }
    });
  }
}