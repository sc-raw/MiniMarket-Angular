// inicio.component.ts
import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ReporteService, ResumenReporte } from '../../core/services/reporte.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterLink, CommonModule],
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

      @if (auth.estaAutenticado()) {

        <!-- ===== ESTADÍSTICAS RÁPIDAS (SOLO ADMIN) ===== -->
        @if (auth.esAdmin()) {
          <div class="row g-3 mb-3">
            <div class="col-md-3 col-4">
              <div class="card text-center border-0 shadow-sm bg-success text-white">
                <div class="card-body py-3">
                  <h5 class="mb-0">🛒 Ventas Hoy</h5>
                  <h2 class="fw-bold">{{ ventasHoy() }}</h2>
                </div>
              </div>
            </div>
            <div class="col-md-3 col-6">
              <div class="card text-center border-0 shadow-sm bg-danger text-white">
                <div class="card-body py-3">
                  <h5 class="mb-0">⚠️ Stock Bajo</h5>
                  <h2 class="fw-bold">{{ stockBajo() }}</h2>
                </div>
              </div>
            </div>
            <div class="col-md-3 col-6">
              <div class="card text-center border-0 shadow-sm bg-primary text-white">
                <div class="card-body py-3">
                  <h5 class="mb-0">👤 Clientes</h5>
                  <h2 class="fw-bold">{{ totalClientes() }}</h2>
                </div>
              </div>
            </div>
            <div class="col-md-3 col-6">
              <div class="card text-center border-0 shadow-sm bg-warning text-dark">
                <div class="card-body py-3">
                  <h5 class="mb-0">📦 Productos</h5>
                  <h2 class="fw-bold">{{ totalProductos() }}</h2>
                </div>
              </div>
            </div>
          </div>
        }

        <!-- ===== TARJETAS DE ACCESO CENTRADAS ===== -->
        <div class="row g-3 justify-content-center">

          <!-- 🔥 CLIENTE: Tienda + Mis Pedidos -->
          @if (auth.esCliente()) {
            <div class="col-lg-3 col-md-6">
              <div class="card h-100 shadow-sm text-center border-0">
                <div class="card-body d-flex flex-column">
                  <div class="display-1">🛒</div>
                  <h5 class="fw-bold">Tienda</h5>
                  <p class="text-muted small">Compra productos online</p>
                  <a class="btn btn-success mt-auto" routerLink="/tienda">Comprar</a>
                </div>
              </div>
            </div>
            <div class="col-lg-3 col-md-6">
              <div class="card h-100 shadow-sm text-center border-0">
                <div class="card-body d-flex flex-column">
                  <div class="display-1">📦</div>
                  <h5 class="fw-bold">Mis Pedidos</h5>
                  <p class="text-muted small">Historial de compras</p>
                  <a class="btn btn-success mt-auto" routerLink="/mis-pedidos">Ver pedidos</a>
                </div>
              </div>
            </div>
          }

          <!-- ATENCIÓN AL CLIENTE -->
          @if (auth.esAtencionCliente()) {
            <div class="col-12">
              <div class="card shadow border-success">
                <div class="card-header text-white" style="background:linear-gradient(135deg,#128C7E,#25D366);">
                  <h5 class="mb-0"><i class="bi bi-whatsapp me-2"></i>Centro de Atención al Cliente</h5>
                </div>
                <div class="card-body d-flex justify-content-between align-items-center">
                  <span>Revisa los pedidos y consultas que llegan por WhatsApp</span>
                  <a class="btn btn-success" routerLink="/pedidos-whatsapp">
                    <i class="bi bi-chat-dots me-2"></i>Ver Pedidos
                  </a>
                </div>
              </div>
            </div>
          }

          <!-- PRODUCTOS - visible para TODOS los autenticados -->
          <div class="col-lg-2 col-md-6">
            <div class="card h-100 shadow-sm text-center border-0">
              <div class="card-body d-flex flex-column">
                <div class="display-1">📦</div>
                <h5 class="fw-bold">Productos</h5>
                <p class="text-muted small">
                  @if (auth.puedeGestionarProductos()) { Gestión de productos }
                  @else if (auth.puedeActualizarStock()) { Reponer stock }
                  @else { Ver catálogo }
                </p>
                <a class="btn btn-success mt-auto" routerLink="/productos">Ingresar</a>
              </div>
            </div>
          </div>

          <!-- REPORTES - visible para ADMIN, CAJERO y ATENCION_CLIENTE -->
          @if (auth.tieneAlgunRol(['ADMIN', 'CAJERO']) || auth.esAtencionCliente()) {
            <div class="col-lg-2 col-md-6">
              <div class="card h-100 shadow-sm text-center border-0">
                <div class="card-body d-flex flex-column">
                  <div class="display-1">📊</div>
                  <h5 class="fw-bold">Reportes</h5>
                  <p class="text-muted small">Estadísticas y análisis</p>
                  <a class="btn btn-success mt-auto" routerLink="/reportes">Ingresar</a>
                </div>
              </div>
            </div>
          }

          <!-- MÓDULOS PARA OTROS ROLES (excluyendo atención al cliente) -->
          @if (!auth.esAtencionCliente()) {

            <!-- Clientes -->
            @if (auth.puedeVerClientes()) {
              <div class="col-lg-2 col-md-6">
                <div class="card h-100 shadow-sm text-center border-0">
                  <div class="card-body d-flex flex-column">
                    <div class="display-1">👤</div>
                    <h5 class="fw-bold">Clientes</h5>
                    <p class="text-muted small">Gestión de clientes</p>
                    <a class="btn btn-success mt-auto" routerLink="/clientes">Ingresar</a>
                  </div>
                </div>
              </div>
            }

            <!-- Categorías -->
            @if (auth.puedeGestionarCategorias()) {
              <div class="col-lg-2 col-md-6">
                <div class="card h-100 shadow-sm text-center border-0">
                  <div class="card-body d-flex flex-column">
                    <div class="display-1">🏷️</div>
                    <h5 class="fw-bold">Categorías</h5>
                    <p class="text-muted small">Administrar categorías</p>
                    <a class="btn btn-success mt-auto" routerLink="/categorias">Ingresar</a>
                  </div>
                </div>
              </div>
            }

            <!-- Empleados -->
            @if (auth.puedeGestionarEmpleados()) {
              <div class="col-lg-2 col-md-6">
                <div class="card h-100 shadow-sm text-center border-0">
                  <div class="card-body d-flex flex-column">
                    <div class="display-1">🧑‍💼</div>
                    <h5 class="fw-bold">Empleados</h5>
                    <p class="text-muted small">Gestión de empleados</p>
                    <a class="btn btn-success mt-auto" routerLink="/empleados">Ingresar</a>
                  </div>
                </div>
              </div>
            }

            <!-- Ventas -->
            @if (auth.puedeVerVentas()) {
              <div class="col-lg-2 col-md-6">
                <div class="card h-100 shadow-sm text-center border-0">
                  <div class="card-body d-flex flex-column">
                    <div class="display-1">🛒</div>
                    <h5 class="fw-bold">Ventas</h5>
                    <p class="text-muted small">Registrar y gestionar ventas</p>
                    <a class="btn btn-success mt-auto" routerLink="/ventas">Ingresar</a>
                  </div>
                </div>
              </div>
            }
          }
        </div>
      } @else {
        <!-- ===== NO AUTENTICADO ===== -->
        <div class="row">
          <div class="col-12">
            <div class="card shadow text-center">
              <div class="card-body p-5">
                <h3>🔐 Inicia sesión para acceder al sistema</h3>
                <a class="btn btn-success btn-lg mt-3" routerLink="/login">
                  <i class="bi bi-box-arrow-in-right"></i> Iniciar sesión
                </a>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class InicioComponent implements OnInit {
  protected auth = inject(AuthService);
  private reporteService = inject(ReporteService);

  ventasHoy = signal(0);
  stockBajo = signal(0);
  totalClientes = signal(0);
  totalProductos = signal(0);

  ngOnInit(): void {
    if (this.auth.estaAutenticado() && this.auth.esAdmin()) {
      this.reporteService.resumen().subscribe({
        next: (data) => {
          this.stockBajo.set(data.cantidadStockBajo ?? 0);
          this.totalProductos.set(data.cantidadProductos ?? 0);
        },
        error: () => {}
      });
    }
  }
}