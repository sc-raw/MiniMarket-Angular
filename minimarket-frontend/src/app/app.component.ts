import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { AuthService } from './core/auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-navbar />
    <main class="py-4 min-vh-100">
      <router-outlet />
    </main>

    <!-- ==================== FOOTER MEJORADO ==================== -->
    <footer class="footer-modern text-white pt-5 pb-3">
      <div class="container">
        <div class="row gy-4">

          <!-- COLUMNA 1: Marca -->
          <div class="col-lg-4 col-md-6">
            <h4 class="fw-bold mb-3">
              <i class="bi bi-cart-fill me-2"></i>MiniMarket
            </h4>
            <p class="text-white-50">
              Sistema integral de gestión de ventas para minimarkets.
              Manejo de productos, clientes, cajeros, ventas y reportes en tiempo real.
            </p>
            <div class="d-flex gap-3 mt-3 fs-5">
              <a href="#" class="text-white-50 text-decoration-none" title="Facebook">
                <i class="bi bi-facebook"></i>
              </a>
              <a href="#" class="text-white-50 text-decoration-none" title="Instagram">
                <i class="bi bi-instagram"></i>
              </a>
              <a href="#" class="text-white-50 text-decoration-none" title="WhatsApp">
                <i class="bi bi-whatsapp"></i>
              </a>
              <a href="#" class="text-white-50 text-decoration-none" title="GitHub">
                <i class="bi bi-github"></i>
              </a>
            </div>
          </div>

          <!-- COLUMNA 2: Enlaces rápidos -->
          <div class="col-lg-2 col-md-6">
            <h6 class="text-uppercase fw-bold mb-3">Navegación</h6>
            <ul class="list-unstyled">
              <li class="mb-2"><a routerLink="/" class="text-white-50 text-decoration-none">Inicio</a></li>
              <li class="mb-2"><a routerLink="/clientes" class="text-white-50 text-decoration-none">Clientes</a></li>
              <li class="mb-2"><a routerLink="/productos" class="text-white-50 text-decoration-none">Productos</a></li>
              <li class="mb-2"><a routerLink="/empleados" class="text-white-50 text-decoration-none">Empleados</a></li>
              <li class="mb-2"><a routerLink="/ventas" class="text-white-50 text-decoration-none">Ventas</a></li>
              <li class="mb-2"><a routerLink="/reportes" class="text-white-50 text-decoration-none">Reportes</a></li>
            </ul>
          </div>

          <!-- COLUMNA 3: Soporte -->
          <div class="col-lg-3 col-md-6">
            <h6 class="text-uppercase fw-bold mb-3">Soporte</h6>
            <ul class="list-unstyled text-white-50">
              <li class="mb-2">
                <i class="bi bi-geo-alt-fill me-2"></i>
                Av. Cibertec 123, Lima, Perú
              </li>
              <li class="mb-2">
                <i class="bi bi-telephone-fill me-2"></i>
                +51 999 888 777
              </li>
              <li class="mb-2">
                <i class="bi bi-envelope-fill me-2"></i>
                soporte&#64;minimarket.pe
              </li>
              <li class="mb-2">
                <i class="bi bi-clock-fill me-2"></i>
                Lun - Sáb: 8:00am - 10:00pm
              </li>
            </ul>
          </div>

          <!-- COLUMNA 4: Usuario conectado -->
          <div class="col-lg-3 col-md-6">
            <h6 class="text-uppercase fw-bold mb-3">Sesión</h6>
            @if (auth.estaAutenticado()) {
              <div class="bg-white bg-opacity-10 rounded p-3">
                <p class="mb-1">
                  <i class="bi bi-person-circle me-2"></i>
                  <strong>{{ auth.usuarioActual()?.username }}</strong>
                </p>
                <p class="mb-0 text-white-50 small">
                  Rol: <span class="badge bg-success">{{ auth.usuarioActual()?.rol }}</span>
                </p>
              </div>
            } @else {
              <p class="text-white-50 mb-2">No hay sesión activa.</p>
              <a routerLink="/login" class="btn btn-outline-light btn-sm">
                <i class="bi bi-box-arrow-in-right me-1"></i> Iniciar sesión
              </a>
            }
          </div>

        </div>

        <hr class="my-4 border-light border-opacity-25">

        <div class="row align-items-center">
          <div class="col-md-6 text-center text-md-start">
            <small class="text-white-50">
              &copy; 2026 MiniMarket — Cibertec. Todos los derechos reservados.
            </small>
          </div>
          <div class="col-md-6 text-center text-md-end">
            <small class="text-white-50">
              Desarrollado con
              <i class="bi bi-heart-fill text-danger mx-1"></i>
              usando Spring Boot + Angular 18
            </small>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer-modern {
      background: linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%);
    }
    .footer-modern a:hover {
      color: #fff !important;
    }
  `]
})
export class AppComponent {
  title = 'minimarket-frontend';
  protected auth = inject(AuthService);
}
