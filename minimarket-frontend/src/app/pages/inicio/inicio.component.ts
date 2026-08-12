import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container mt-4">
      <div class="card shadow border-0 mb-4">
        <div class="card-body text-center p-5">
          <h1 class="fw-bold text-success">
            <i class="bi bi-cart-fill"></i> MiniMarket
          </h1>
          <h4 class="text-secondary">Sistema de Gestión de Ventas de MiniMarket</h4>
          <p class="lead">Frontend en Angular que consume la API REST del backend Spring Boot.</p>
        </div>
      </div>
      <div class="row">
        <div class="col-lg-3 col-md-6 mb-4">
          <div class="card h-100 shadow-sm text-center">
            <div class="card-body">
              <h1>👤</h1><h4>Clientes</h4>
              <a class="btn btn-success" routerLink="/clientes">Ingresar</a>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 mb-4">
          <div class="card h-100 shadow-sm text-center">
            <div class="card-body">
              <h1>📦</h1><h4>Productos</h4>
              <a class="btn btn-success" routerLink="/productos">Ingresar</a>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 mb-4">
          <div class="card h-100 shadow-sm text-center">
            <div class="card-body">
              <h1>🧑‍💼</h1><h4>Cajeros</h4>
              <a class="btn btn-success" routerLink="/cajeros">Ingresar</a>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 mb-4">
          <div class="card h-100 shadow-sm text-center">
            <div class="card-body">
              <h1>🛒</h1><h4>Ventas</h4>
              <a class="btn btn-success" routerLink="/ventas">Ingresar</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class InicioComponent {}
