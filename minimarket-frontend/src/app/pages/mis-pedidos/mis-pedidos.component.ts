import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

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

      @if (cargando()) {
        <div class="text-center py-4">
          <span class="spinner-border text-success"></span>
        </div>
      } @else if (error()) {
        <div class="alert alert-danger">{{ error() }}</div>
      } @else if (sinCliente()) {
        <div class="alert alert-info">
          Aún no tienes un perfil de cliente vinculado.
          Realiza tu primera compra en la tienda para ver tus pedidos aquí.
        </div>
      } @else if (pedidos().length > 0) {
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
      } @else {
        <div class="alert alert-info">No tienes pedidos registrados.</div>
      }
    </div>
  `
})
export class MisPedidosComponent implements OnInit {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  cargando = signal(false);
  sinCliente = signal(false);
  error = signal('');
  pedidos = signal<any[]>([]);

  ngOnInit(): void {
    const clienteId = this.auth.clienteId();
    if (!clienteId) {
      this.sinCliente.set(true);
      return;
    }
    this.cargar(clienteId);
  }

  private cargar(clienteId: number) {
    this.cargando.set(true);
    this.error.set('');
    this.http.get<any[]>(`/api/clientes/${clienteId}/pedidos`).subscribe({
      next: (data) => this.pedidos.set(data ?? []),
      error: () => {
        this.pedidos.set([]);
        this.error.set('Error al consultar tus pedidos.');
      },
      complete: () => this.cargando.set(false)
    });
  }
}