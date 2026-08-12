import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
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
              <a class="nav-link" routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">🏠 Inicio</a>
            </li>
            @if (auth.estaAutenticado()) {
              <li class="nav-item">
                <a class="nav-link" routerLink="/clientes" routerLinkActive="active">👤 Clientes</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/productos" routerLinkActive="active">📦 Productos</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/cajeros" routerLinkActive="active">🧑‍💼 Cajeros</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/ventas" routerLinkActive="active">🛒 Ventas</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/reportes" routerLinkActive="active">📊 Reportes</a>
              </li>
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
                  👤 {{ auth.usuarioActual()?.username }}
                </a>
                <ul class="dropdown-menu dropdown-menu-end">
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
