import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { DatePipe, CommonModule } from '@angular/common';  // 🔥 AGREGAR CommonModule
import { ReporteService, ResumenReporte } from '../../core/services/reporte.service';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [DatePipe, CommonModule],  // 🔥 AGREGAR CommonModule
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container mt-4">
      <div class="card shadow border-0 mb-4">
        <div class="card-header text-white" style="background:#2E7D32;">
          <h4 class="mb-0"><i class="bi bi-bar-chart-fill"></i> Reportes y Estadísticas</h4>
        </div>
      </div>

      @if (cargando()) {
        <div class="text-center py-5"><div class="spinner-border text-success" role="status"></div></div>
      } @else {

        <!-- ========== CONTADORES SUPERIORES ========== -->
        <div class="row mb-4">

          <!-- Contadores Financieros -->
          <div class="col-md-2 mb-2">
            <div class="card text-white bg-success h-100">
              <div class="card-body text-center">
                <h6>Total Ventas</h6>
                <h2>S/. {{ resumen()?.totalVentasFinalizadas ?? 0 }}</h2>
              </div>
            </div>
          </div>

          <div class="col-md-2 mb-2">
            <div class="card text-white bg-primary h-100">
              <div class="card-body text-center">
                <h6>Cantidad de Ventas</h6>
                <h2>{{ resumen()?.cantidadVentas ?? 0 }}</h2>
              </div>
            </div>
          </div>

          <!-- Contadores de Stock -->
          <div class="col-md-2 mb-2">
            <div class="card text-white bg-info h-100">
              <div class="card-body text-center">
                <h6>Total Productos</h6>
                <h2>{{ resumen()?.cantidadProductos ?? 0 }}</h2>
              </div>
            </div>
          </div>

          <div class="col-md-2 mb-2">
            <div class="card text-white bg-danger h-100">
              <div class="card-body text-center">
                <h6>Stock Bajo</h6>
                <h2>{{ resumen()?.cantidadStockBajo ?? 0 }}</h2>
              </div>
            </div>
          </div>

          <div class="col-md-2 mb-2">
            <div class="card text-white bg-danger h-100">
              <div class="card-body text-center">
                <h6><i class="bi bi-exclamation-octagon-fill"></i> Vencidos</h6>
                <h2>{{ resumen()?.cantidadVencidos ?? 0 }}</h2>
              </div>
            </div>
          </div>

          <div class="col-md-2 mb-2">
            <div class="card text-white bg-warning h-100">
              <div class="card-body text-center">
                <h6><i class="bi bi-clock-history"></i> Por Vencer</h6>
                <h2>{{ resumen()?.cantidadPorVencer ?? 0 }}</h2>
              </div>
            </div>
          </div>

        </div>

        <!-- ========== TABLAS ========== -->
        <div class="row">

          <!-- VENTAS POR ESTADO -->
          @if (auth.puedeVerReportesFinancieros()) {
            <div class="col-md-6 mb-4">
              <div class="card shadow">
                <div class="card-header bg-dark text-white">
                  <h5 class="mb-0"><i class="bi bi-pie-chart-fill me-2"></i>Ventas por Estado</h5>
                </div>
                <div class="card-body">
                  <table class="table table-sm table-hover">
                    <thead class="table-light">
                      <tr><th>Estado</th><th class="text-end">Cantidad</th></tr>
                    </thead>
                    <tbody>
                      @for (e of ventasEstado(); track e[0]) {
                        <tr>
                          <td>
                            <span class="badge"
                                  [class.bg-warning]="e[0] === 'PENDIENTE'"
                                  [class.bg-info]="e[0] === 'EN_PROCESO'"
                                  [class.bg-success]="e[0] === 'COMPLETADO' || e[0] === 'FINALIZADA'"
                                  [class.bg-danger]="e[0] === 'CANCELADA'">
                              {{ e[0] }}
                            </span>
                          </td>
                          <td class="text-end fw-bold">{{ e[1] }}</td>
                        </tr>
                      } @empty {
                        <tr><td colspan="2" class="text-center text-muted">Sin datos</td></tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- TOP PRODUCTOS MÁS VENDIDOS -->
            <div class="col-md-6 mb-4">
              <div class="card shadow">
                <div class="card-header bg-dark text-white">
                  <h5 class="mb-0"><i class="bi bi-trophy-fill me-2"></i>Top Productos Más Vendidos</h5>
                </div>
                <div class="card-body">
                  <table class="table table-sm table-hover">
                    <thead class="table-light">
                      <tr><th>#</th><th>Producto</th><th class="text-end">Cantidad</th></tr>
                    </thead>
                    <tbody>
                      @for (p of topProductos() | slice:0:3; track $index; let i = $index) {
                        <tr>
                          <td>{{ i + 1 }}</td>
                          <td>{{ p[0] }}</td>
                          <td class="text-end fw-bold">{{ p[1] }}</td>
                        </tr>
                      } @empty {
                        <tr><td colspan="3" class="text-center text-muted">Sin datos</td></tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          }

          <!-- STOCK BAJO -->
          @if (auth.puedeVerReportesStock()) {
            <div class="col-md-6 mb-4">
              <div class="card shadow border-danger">
                <div class="card-header bg-danger text-white">
                  <h5 class="mb-0"><i class="bi bi-box-seam me-2"></i>Productos con Stock Bajo</h5>
                </div>
                <div class="card-body">
                  <table class="table table-sm table-hover">
                    <thead class="table-light">
                      <tr><th>Código</th><th>Nombre</th><th class="text-end">Stock</th></tr>
                    </thead>
                    <tbody>
                      @for (p of stockBajo() | slice:0:3; track p.idProducto) {
                        <tr>
                          <td>{{ p.codigo }}</td>
                          <td>{{ p.nombre }}</td>
                          <td class="text-end"><span class="badge bg-danger">{{ p.stock }}</span></td>
                        </tr>
                      } @empty {
                        <tr><td colspan="3" class="text-center text-muted">✅ Todo el stock está OK</td></tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- PRODUCTOS VENCIDOS -->
            <div class="col-md-6 mb-4">
              <div class="card shadow border-danger">
                <div class="card-header bg-danger text-white">
                  <h5 class="mb-0"><i class="bi bi-exclamation-octagon-fill me-2"></i>Productos Vencidos</h5>
                </div>
                <div class="card-body">
                  <table class="table table-sm table-hover">
                    <thead class="table-light">
                      <tr><th>Código</th><th>Nombre</th><th>Vencimiento</th><th class="text-end">Stock</th></tr>
                    </thead>
                    <tbody>
                      @for (p of productosVencidos() | slice:0:3; track p.idProducto) {
                        <tr>
                          <td>{{ p.codigo }}</td>
                          <td>{{ p.nombre }}</td>
                          <td><span class="badge bg-danger">{{ p.fechaVencimiento | date:'dd/MM/yyyy' }}</span></td>
                          <td class="text-end">{{ p.stock }}</td>
                        </tr>
                      } @empty {
                        <tr><td colspan="4" class="text-center text-muted">✅ No hay productos vencidos</td></tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- PRODUCTOS PRÓXIMOS A VENCER -->
            <div class="col-md-6 mb-4">
              <div class="card shadow border-warning">
                <div class="card-header bg-warning text-dark">
                  <h5 class="mb-0"><i class="bi bi-clock-history me-2"></i>Próximos a Vencer (7 días)</h5>
                </div>
                <div class="card-body">
                  <table class="table table-sm table-hover">
                    <thead class="table-light">
                      <tr><th>Código</th><th>Nombre</th><th>Vence</th><th class="text-end">Stock</th></tr>
                    </thead>
                    <tbody>
                      @for (p of productosPorVencer() | slice:0:3; track p.idProducto) {
                        <tr>
                          <td>{{ p.codigo }}</td>
                          <td>{{ p.nombre }}</td>
                          <td><span class="badge bg-warning text-dark">{{ p.fechaVencimiento | date:'dd/MM/yyyy' }}</span></td>
                          <td class="text-end">{{ p.stock }}</td>
                        </tr>
                      } @empty {
                        <tr><td colspan="4" class="text-center text-muted">✅ Ningún producto próximo a vencer</td></tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          }

        </div>
      }
    </div>
  `
})
export class ReportesComponent implements OnInit {
  private reporteService = inject(ReporteService);
  protected auth = inject(AuthService);

  cargando = signal(true);
  resumen = signal<ResumenReporte | null>(null);
  ventasEstado = signal<any[]>([]);
  topProductos = signal<any[]>([]);
  stockBajo = signal<any[]>([]);
  productosVencidos = signal<any[]>([]);
  productosPorVencer = signal<any[]>([]);

  ngOnInit(): void {
    this.reporteService.resumen().subscribe(d => this.resumen.set(d));
    this.reporteService.ventasPorEstado().subscribe(d => this.ventasEstado.set(d));
    this.reporteService.topProductos().subscribe(d => this.topProductos.set(d));
    this.reporteService.stockBajo().subscribe(d => this.stockBajo.set(d));
    this.reporteService.productosVencidos().subscribe(d => this.productosVencidos.set(d));
    this.reporteService.productosPorVencer(7).subscribe({
      next: (d) => { this.productosPorVencer.set(d); this.cargando.set(false); },
      error: () => this.cargando.set(false)
    });
  }
}