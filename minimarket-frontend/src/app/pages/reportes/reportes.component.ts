import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { ReporteService, ResumenReporte } from '../../core/services/reporte.service';

@Component({
  selector: 'app-reportes',
  standalone: true,
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
        <!-- TARJETAS DE RESUMEN -->
        <div class="row mb-4">
          <div class="col-md-3 mb-3">
            <div class="card text-white bg-success h-100">
              <div class="card-body text-center">
                <h6>Total Ventas (Finalizadas)</h6>
                <h2>S/. {{ resumen()?.totalVentasFinalizadas ?? 0 }}</h2>
              </div>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="card text-white bg-primary h-100">
              <div class="card-body text-center">
                <h6>Cantidad de Ventas</h6>
                <h2>{{ resumen()?.cantidadVentas ?? 0 }}</h2>
              </div>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="card text-white bg-info h-100">
              <div class="card-body text-center">
                <h6>Cantidad de Productos</h6>
                <h2>{{ resumen()?.cantidadProductos ?? 0 }}</h2>
              </div>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="card text-white bg-danger h-100">
              <div class="card-body text-center">
                <h6>Productos con Stock Bajo</h6>
                <h2>{{ resumen()?.cantidadStockBajo ?? 0 }}</h2>
              </div>
            </div>
          </div>
        </div>

        <div class="row">
          <!-- VENTAS POR ESTADO -->
          <div class="col-md-6 mb-4">
            <div class="card shadow">
              <div class="card-header"><h5 class="mb-0">Ventas por Estado</h5></div>
              <div class="card-body">
                <table class="table table-sm">
                  <thead><tr><th>Estado</th><th class="text-end">Cantidad</th></tr></thead>
                  <tbody>
                    @for (e of ventasEstado(); track e[0]) {
                      <tr>
                        <td>
                          <span class="badge"
                                [class.bg-warning]="e[0] === 'PENDIENTE'"
                                [class.bg-info]="e[0] === 'EN_PROCESO'"
                                [class.bg-primary]="e[0] === 'FINALIZADA'"
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

          <!-- TOP CLIENTES -->
          <div class="col-md-6 mb-4">
            <div class="card shadow">
              <div class="card-header"><h5 class="mb-0">Top Clientes</h5></div>
              <div class="card-body">
                <table class="table table-sm">
                  <thead><tr><th>#</th><th>Cliente</th><th class="text-end">Compras</th></tr></thead>
                  <tbody>
                    @for (c of topClientes(); track $index; let i = $index) {
                      <tr>
                        <td>{{ i + 1 }}</td>
                        <td>{{ c[0] }} {{ c[1] }}</td>
                        <td class="text-end fw-bold">{{ c[2] }}</td>
                      </tr>
                    } @empty {
                      <tr><td colspan="3" class="text-center text-muted">Sin datos</td></tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- TOP PRODUCTOS VENDIDOS -->
          <div class="col-md-6 mb-4">
            <div class="card shadow">
              <div class="card-header"><h5 class="mb-0">Top Productos Más Vendidos</h5></div>
              <div class="card-body">
                <table class="table table-sm">
                  <thead><tr><th>#</th><th>Producto</th><th class="text-end">Cantidad</th></tr></thead>
                  <tbody>
                    @for (p of topProductos(); track $index; let i = $index) {
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

          <!-- STOCK BAJO -->
          <div class="col-md-6 mb-4">
            <div class="card shadow border-danger">
              <div class="card-header bg-danger text-white"><h5 class="mb-0">Productos con Stock Bajo</h5></div>
              <div class="card-body">
                <table class="table table-sm">
                  <thead><tr><th>Código</th><th>Nombre</th><th class="text-end">Stock</th></tr></thead>
                  <tbody>
                    @for (p of stockBajo(); track p.idProducto) {
                      <tr>
                        <td>{{ p.codigo }}</td>
                        <td>{{ p.nombre }}</td>
                        <td class="text-end"><span class="badge bg-danger">{{ p.stock }}</span></td>
                      </tr>
                    } @empty {
                      <tr><td colspan="3" class="text-center text-muted">Todo el stock está OK</td></tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class ReportesComponent implements OnInit {
  private reporteService = inject(ReporteService);

  cargando = signal(true);
  resumen = signal<ResumenReporte | null>(null);
  ventasEstado = signal<any[]>([]);
  topClientes = signal<any[]>([]);
  topProductos = signal<any[]>([]);
  stockBajo = signal<any[]>([]);

  ngOnInit(): void {
    this.reporteService.resumen().subscribe(d => this.resumen.set(d));
    this.reporteService.ventasPorEstado().subscribe(d => this.ventasEstado.set(d));
    this.reporteService.topClientes().subscribe(d => this.topClientes.set(d));
    this.reporteService.topProductos().subscribe(d => this.topProductos.set(d));
    this.reporteService.stockBajo().subscribe({
      next: (d) => { this.stockBajo.set(d); this.cargando.set(false); },
      error: () => this.cargando.set(false)
    });
  }
}
