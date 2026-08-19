// navbar.component.ts
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark">
      <div class="container-fluid">
        <a class="navbar-brand fw-bold" routerLink="/">
          <i class="bi bi-cart-fill me-2"></i> MiniMarket
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#menu">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="menu">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item">
              <a class="nav-link" routerLink="/" routerLinkActive="active" 
                 [routerLinkActiveOptions]="{exact:true}">🏠 Inicio</a>
            </li>
            
            @if (auth.estaAutenticado()) {

              <!-- 🔥 CLIENTE: links a Tienda y Mis Pedidos -->
              @if (auth.esCliente()) {
                <li class="nav-item">
                  <a class="nav-link" routerLink="/tienda" routerLinkActive="active">🛒 Tienda</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" routerLink="/mis-pedidos" routerLinkActive="active">📦 Mis Pedidos</a>
                </li>
              }

              <!-- 🔥 ATENCIÓN AL CLIENTE -->
              @if (auth.esAtencionCliente()) {
                <li class="nav-item">
                  <a class="nav-link" routerLink="/pedidos-whatsapp" routerLinkActive="active">
                    💬 Pedidos WhatsApp
                  </a>
                </li>
              }

              <!-- 👤 Clientes: ADMIN o CAJERO -->
              @if (auth.tieneAlgunRol(['ADMIN', 'CAJERO'])) {
                <li class="nav-item">
                  <a class="nav-link" routerLink="/clientes" routerLinkActive="active">👤 Clientes</a>
                </li>
              }

              <!-- 📦 Productos: visible para TODOS los autenticados -->
              <li class="nav-item">
                <a class="nav-link" routerLink="/productos" routerLinkActive="active">📦 Productos</a>
              </li>

              <!-- 🏷️ Categorías: SOLO ADMIN -->
              @if (auth.tieneRol('ADMIN')) {
                <li class="nav-item">
                  <a class="nav-link" routerLink="/categorias" routerLinkActive="active">🏷️ Categorías</a>
                </li>
              }

              <!-- 🧑‍💼 Cajeros: SOLO ADMIN -->
              @if (auth.tieneRol('ADMIN')) {
                <li class="nav-item">
                  <a class="nav-link" routerLink="/cajeros" routerLinkActive="active">🧑‍💼 Cajeros</a>
                </li>
              }

              <!-- 🛒 Ventas: ADMIN, CAJERO o REPONEDOR -->
              @if (auth.tieneAlgunRol(['ADMIN', 'CAJERO'])) {
                <li class="nav-item">
                  <a class="nav-link" routerLink="/ventas" routerLinkActive="active">🛒 Ventas</a>
                </li>
              }

              <!-- 📊 Reportes: ADMIN, CAJERO o REPONEDOR -->
              @if (auth.tieneAlgunRol(['ADMIN', 'CAJERO', 'REPONEDOR'])) {
                <li class="nav-item">
                  <a class="nav-link" routerLink="/reportes" routerLinkActive="active">📊 Reportes</a>
                </li>
              }

              <!-- Dropdown usuario -->
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
                  👤 {{ auth.nombreCompleto() }}
                </a>
                <ul class="dropdown-menu dropdown-menu-end">
                  <li><span class="dropdown-item-text">Usuario: <strong>{{ auth.usuarioActual()?.username }}</strong></span></li>
                  <li><span class="dropdown-item-text">Rol: <strong>{{ auth.usuarioActual()?.rol }}</strong></span></li>
                  <li><hr class="dropdown-divider"></li>
                  <li>
                    <button class="dropdown-item text-danger" (click)="logout()">
                      <i class="bi bi-box-arrow-right"></i> Cerrar sesión
                    </button>
                  </li>
                </ul>
              </li>

              
            } @else {
              <li class="nav-item">
                <a class="nav-link" routerLink="/login">
                  <i class="bi bi-box-arrow-in-right"></i> Iniciar sesión
                </a>
              </li>
            }
          </ul>
        </div>
      </div>
    </nav>
  `,
  styles: [`.navbar-dark { background-color: #2E7D32; }`]
})
export class NavbarComponent {
  protected auth = inject(AuthService);
  private router = inject(Router);

  logout(): void {
  this.auth.logout();
  this.router.navigate(['/login']);
}
}