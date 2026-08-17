import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

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
          @if (auth.estaAutenticado()) {
            <p class="lead">
              Bienvenido <strong>{{ auth.usuarioActual()?.username }}</strong>
              ({{ auth.usuarioActual()?.rol }})
            </p>
          } @else {
            <p class="lead">Frontend en Angular que consume la API REST del backend Spring Boot.</p>
          }
        </div>
      </div>

      <div class="row">
        @if (auth.estaAutenticado()) {
          <!-- ===== DASHBOARD ATENCIÓN AL CLIENTE ===== -->
          @if (auth.esAtencionCliente()) {
            <div class="col-12 mb-4">
              <div class="card shadow border-success">
                <div class="card-header text-white" style="background:linear-gradient(135deg,#128C7E,#25D366);">
                  <h4 class="mb-0">
                    <i class="bi bi-whatsapp me-2"></i>
                    Centro de Atención al Cliente
                  </h4>
                </div>
                <div class="card-body">
                  <p class="text-muted">
                    Revisa los pedidos y consultas que llegan por WhatsApp de los clientes.
                    Responde directamente y los mensajes se envían automáticamente.
                  </p>
                  <a class="btn btn-success btn-lg" routerLink="/pedidos-whatsapp">
                    <i class="bi bi-chat-dots me-2"></i> Ver Pedidos WhatsApp
                  </a>
                </div>
              </div>
            </div>

            <div class="col-lg-4 col-md-6 mb-4">
              <div class="card h-100 shadow-sm text-center">
                <div class="card-body">
                  <h1>📦</h1>
                  <h4>Productos</h4>
                  <p class="text-muted small">Ver disponibilidad</p>
                  <a class="btn btn-success" routerLink="/productos">Ver Catálogo</a>
                </div>
              </div>
            </div>

            <div class="col-lg-4 col-md-6 mb-4">
              <div class="card h-100 shadow-sm text-center">
                <div class="card-body">
                  <h1>👤</h1>
                  <h4>Clientes</h4>
                  <p class="text-muted small">Gestión de clientes</p>
                  <a class="btn btn-success" routerLink="/clientes">Ingresar</a>
                </div>
              </div>
            </div>

            <div class="col-lg-4 col-md-6 mb-4">
              <div class="card h-100 shadow-sm text-center">
                <div class="card-body">
                  <h1>📊</h1>
                  <h4>Reportes</h4>
                  <p class="text-muted small">Estadísticas de ventas</p>
                  <a class="btn btn-success" routerLink="/reportes">Ingresar</a>
                </div>
              </div>
            </div>
          }

          <!-- ===== DASHBOARD OTROS ROLES ===== -->
          @if (!auth.esAtencionCliente()) {
            @if (auth.puedeVerClientes()) {
              <div class="col-lg-3 col-md-6 mb-4">
                <div class="card h-100 shadow-sm text-center">
                  <div class="card-body">
                    <h1>👤</h1><h4>Clientes</h4>
                    <a class="btn btn-success" routerLink="/clientes">Ingresar</a>
                  </div>
                </div>
              </div>
            }

            <div class="col-lg-3 col-md-6 mb-4">
              <div class="card h-100 shadow-sm text-center">
                <div class="card-body">
                  <h1>📦</h1>
                  <h4>Productos</h4>
                  @if (auth.puedeGestionarProductos()) {
                    <a class="btn btn-success" routerLink="/productos">Gestionar</a>
                  } @else if (auth.puedeActualizarStock()) {
                    <a class="btn btn-success" routerLink="/productos">Reponer Stock</a>
                  } @else {
                    <a class="btn btn-success" routerLink="/productos">Ver</a>
                  }
                </div>
              </div>
            </div>

            @if (auth.puedeGestionarCategorias()) {
              <div class="col-lg-3 col-md-6 mb-4">
                <div class="card h-100 shadow-sm text-center">
                  <div class="card-body">
                    <h1>🏷️</h1><h4>Categorías</h4>
                    <a class="btn btn-success" routerLink="/categorias">Ingresar</a>
                  </div>
                </div>
              </div>
            }

            @if (auth.puedeGestionarEmpleados()) {
              <div class="col-lg-3 col-md-6 mb-4">
                <div class="card h-100 shadow-sm text-center">
                  <div class="card-body">
                    <h1>🧑‍💼</h1><h4>Empleados</h4>
                    <a class="btn btn-success" routerLink="/empleados">Ingresar</a>
                  </div>
                </div>
              </div>
            }

            @if (auth.puedeVerVentas()) {
              <div class="col-lg-3 col-md-6 mb-4">
                <div class="card h-100 shadow-sm text-center">
                  <div class="card-body">
                    <h1>🛒</h1><h4>Ventas</h4>
                    <a class="btn btn-success" routerLink="/ventas">Ingresar</a>
                  </div>
                </div>
              </div>
            }

            <div class="col-lg-3 col-md-6 mb-4">
              <div class="card h-100 shadow-sm text-center">
                <div class="card-body">
                  <h1>📊</h1><h4>Reportes</h4>
                  <a class="btn btn-success" routerLink="/reportes">Ingresar</a>
                </div>
              </div>
            </div>
          }
        } @else {
          <div class="col-lg-12 mb-4">
            <div class="card shadow text-center">
              <div class="card-body p-5">
                <h3>Debes iniciar sesión para acceder al sistema</h3>
                <a class="btn btn-success btn-lg mt-3" routerLink="/login">
                  <i class="bi bi-box-arrow-in-right"></i> Iniciar sesión
                </a>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class InicioComponent {
  protected auth = inject(AuthService);
}
