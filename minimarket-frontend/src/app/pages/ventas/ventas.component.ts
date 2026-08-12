import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { VentaService } from '../../core/services/venta.service';
import { ClienteService } from '../../core/services/cliente.service';
import { CajeroService } from '../../core/services/cajero.service';
import { ProductoService } from '../../core/services/producto.service';
import { Venta, Cliente, Cajero, Producto, CrearVentaRequest, DetalleVentaRequest } from '../../core/models/models';

interface LineaDetalle {
  productoId: number | null;
  cantidad: number;
}

@Component({
  selector: 'app-ventas',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, DatePipe],
  template: `
    <div class="container mt-5">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Ventas</h2>
          <p class="text-muted">Gestión de ventas registradas.</p>
        </div>
        <button class="btn btn-success" (click)="abrirFormulario()">
          <i class="bi bi-plus-circle"></i> Nueva Venta
        </button>
      </div>

      @if (error()) {
        <div class="alert alert-danger alert-dismissible fade show">
          <i class="bi bi-exclamation-triangle-fill"></i> {{ error() }}
          <button type="button" class="btn-close" (click)="error.set('')"></button>
        </div>
      }

      @if (mensaje()) {
        <div class="alert alert-success alert-dismissible fade show">
          <i class="bi bi-check-circle-fill"></i> {{ mensaje() }}
          <button type="button" class="btn-close" (click)="mensaje.set('')"></button>
        </div>
      }

      @if (cargando()) {
        <div class="text-center py-5"><div class="spinner-border text-success" role="status"></div></div>
      } @else {
        <div class="card shadow">
          <div class="card-body">
            <table class="table table-hover table-bordered align-middle">
              <thead class="table-dark">
                <tr class="text-center">
                  <th>ID</th><th>Cliente</th><th>Cajero</th><th>Fecha</th>
                  <th>Total</th><th>Estado</th><th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (v of ventas(); track v.id) {
                  <tr>
                    <td class="text-center">{{ v.id }}</td>
                    <td>{{ v.cliente?.nombres }} {{ v.cliente?.apellidos }}</td>
                    <td>{{ v.cajero?.nombres }} {{ v.cajero?.apellidos }}</td>
                    <td class="text-center">{{ v.fechaRegistro | date:'yyyy-MM-dd HH:mm' }}</td>
                    <td class="text-end fw-bold">S/. {{ v.total }}</td>
                    <td class="text-center">
                      @switch (v.estado) {
                        @case ('PENDIENTE') { <span class="badge bg-warning text-dark">{{ v.estado }}</span> }
                        @case ('EN_PROCESO') { <span class="badge bg-info text-dark">{{ v.estado }}</span> }
                        @case ('FINALIZADA') { <span class="badge bg-primary">{{ v.estado }}</span> }
                        @case ('CANCELADA') { <span class="badge bg-danger">{{ v.estado }}</span> }
                        @default { <span class="badge bg-secondary">{{ v.estado }}</span> }
                      }
                    </td>
                    <td class="text-center">
                      @if (v.estado === 'PENDIENTE') {
                        <button class="btn btn-sm btn-primary me-1" (click)="cambiarEstado(v.id!, 'EN_PROCESO')" title="Iniciar">
                          <i class="bi bi-play-fill"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" (click)="cambiarEstado(v.id!, 'CANCELADA')" title="Cancelar">
                          <i class="bi bi-x-circle"></i>
                        </button>
                      }
                      @if (v.estado === 'EN_PROCESO') {
                        <button class="btn btn-sm btn-success" (click)="cambiarEstado(v.id!, 'FINALIZADA')" title="Finalizar">
                          <i class="bi bi-check2-all"></i>
                        </button>
                      }
                    </td>
                  </tr>
                } @empty {
                  <tr><td colspan="7" class="text-center text-muted py-4">
                    <i class="bi bi-exclamation-circle"></i> No existen ventas registradas.
                  </td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      @if (mostrarFormulario()) {
        <div class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.5)">
          <div class="modal-dialog modal-lg">
            <div class="modal-content">
              <div class="modal-header text-white" style="background:#2E7D32;">
                <h5 class="modal-title"><i class="bi bi-cart-plus"></i> Nueva Venta</h5>
                <button type="button" class="btn-close btn-close-white" (click)="cerrarFormulario()"></button>
              </div>
              <div class="modal-body">
                <form (ngSubmit)="guardarVenta()">
                  <div class="row mb-3">
                    <div class="col-md-6 mb-3">
                      <label class="form-label fw-bold">Cliente</label>
                      <select class="form-select" [(ngModel)]="nuevaVenta.clienteId" name="clienteId" required>
                        <option [ngValue]="0">Seleccione...</option>
                        @for (c of clientes(); track c.id) {
                          <option [ngValue]="c.id">{{ c.dni }} - {{ c.nombres }} {{ c.apellidos }}</option>
                        }
                      </select>
                    </div>
                    <div class="col-md-6 mb-3">
                      <label class="form-label fw-bold">Cajero</label>
                      <select class="form-select" [(ngModel)]="nuevaVenta.cajeroId" name="cajeroId" required>
                        <option [ngValue]="0">Seleccione...</option>
                        @for (c of cajeros(); track c.id) {
                          <option [ngValue]="c.id">{{ c.dni }} - {{ c.nombres }} {{ c.apellidos }} ({{ c.turno }})</option>
                        }
                      </select>
                    </div>
                  </div>

                  <hr>
                  <h6 class="fw-bold mb-3"><i class="bi bi-list-check"></i> Productos a vender</h6>

                  @for (linea of lineasDetalle(); track $index; let i = $index) {
                    <div class="row mb-2">
                      <div class="col-md-7">
                        <select class="form-select" [(ngModel)]="linea.productoId" [name]="'producto' + i" required>
                          <option [ngValue]="null">Seleccione producto...</option>
                          @for (p of productos(); track p.idProducto) {
                            <option [ngValue]="p.idProducto">
                              {{ p.codigo }} - {{ p.nombre }} (S/. {{ p.precio }}) - Stock: {{ p.stock }}
                            </option>
                          }
                        </select>
                      </div>
                      <div class="col-md-3">
                        <input type="number" class="form-control" [(ngModel)]="linea.cantidad"
                               [name]="'cantidad' + i" min="1" value="1" required>
                      </div>
                      <div class="col-md-2">
                        <button type="button" class="btn btn-danger btn-sm w-100" (click)="eliminarLinea(i)"
                                [disabled]="lineasDetalle().length === 1">
                          <i class="bi bi-dash"></i>
                        </button>
                      </div>
                    </div>
                  }

                  <button type="button" class="btn btn-outline-success btn-sm mb-3" (click)="agregarLinea()">
                    <i class="bi bi-plus-circle"></i> Agregar producto
                  </button>

                  <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" (click)="cerrarFormulario()">Cancelar</button>
                    <button type="submit" class="btn btn-success" [disabled]="guardando()">
                      @if (guardando()) {
                        <span class="spinner-border spinner-border-sm"></span> Guardando...
                      } @else {
                        <i class="bi bi-check-circle-fill"></i> Registrar Venta
                      }
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class VentasComponent implements OnInit {
  private ventaService = inject(VentaService);
  private clienteService = inject(ClienteService);
  private cajeroService = inject(CajeroService);
  private productoService = inject(ProductoService);

  ventas = signal<Venta[]>([]);
  clientes = signal<Cliente[]>([]);
  cajeros = signal<Cajero[]>([]);
  productos = signal<Producto[]>([]);

  cargando = signal(true);
  guardando = signal(false);
  mostrarFormulario = signal(false);
  mensaje = signal('');
  error = signal('');

  nuevaVenta: CrearVentaRequest = { clienteId: 0, cajeroId: 0, productos: [] };
  lineasDetalle = signal<LineaDetalle[]>([{ productoId: null, cantidad: 1 }]);

  ngOnInit(): void {
    this.ventaService.listar().subscribe({
      next: (data) => { this.ventas.set(data); this.cargando.set(false); },
      error: (err) => { console.error(err); this.cargando.set(false); }
    });
    this.clienteService.listar().subscribe(d => this.clientes.set(d));
    this.cajeroService.listar().subscribe(d => this.cajeros.set(d));
    this.productoService.listar().subscribe(d => this.productos.set(d));
  }

  abrirFormulario(): void {
    this.nuevaVenta = { clienteId: 0, cajeroId: 0, productos: [] };
    this.lineasDetalle.set([{ productoId: null, cantidad: 1 }]);
    this.mostrarFormulario.set(true);
  }

  cerrarFormulario(): void {
    this.mostrarFormulario.set(false);
  }

  agregarLinea(): void {
    this.lineasDetalle.update(lines => [...lines, { productoId: null, cantidad: 1 }]);
  }

  eliminarLinea(i: number): void {
    this.lineasDetalle.update(lines => lines.filter((_, idx) => idx !== i));
  }

  guardarVenta(): void {
    this.error.set('');
    this.mensaje.set('');

    if (!this.nuevaVenta.clienteId || !this.nuevaVenta.cajeroId) {
      this.error.set('Debe seleccionar cliente y cajero.');
      return;
    }
    const lineasValidas = this.lineasDetalle().filter(l => l.productoId && l.cantidad > 0);
    if (lineasValidas.length === 0) {
      this.error.set('Debe agregar al menos un producto con cantidad mayor a 0.');
      return;
    }

    this.nuevaVenta.productos = lineasValidas.map(l => ({
      productoId: l.productoId!,
      cantidad: l.cantidad
    }));

    this.guardando.set(true);
    this.ventaService.crear(this.nuevaVenta).subscribe({
      next: (venta) => {
        this.guardando.set(false);
        this.cerrarFormulario();
        this.mensaje.set(`Venta #${venta.id} registrada correctamente.`);
        this.ventaService.listar().subscribe(data => this.ventas.set(data));
      },
      error: (err) => {
        this.guardando.set(false);
        const msg = err.error?.message || err.error || err.message || 'Error al crear la venta';
        this.error.set(typeof msg === 'string' ? msg : 'Error al crear la venta');
      }
    });
  }

  cambiarEstado(id: number, estado: string): void {
    this.error.set('');
    this.mensaje.set('');
    this.ventaService.actualizarEstado(id, estado).subscribe({
      next: () => {
        this.mensaje.set(`Estado actualizado a: ${estado}`);
        this.ventaService.listar().subscribe(data => this.ventas.set(data));
      },
      error: (err) => {
        const msg = err.error?.message || err.error || err.message || 'Error';
        this.error.set(typeof msg === 'string' ? msg : 'Error al actualizar estado');
      }
    });
  }
}
