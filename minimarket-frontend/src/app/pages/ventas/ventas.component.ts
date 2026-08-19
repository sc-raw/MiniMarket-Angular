// ventas.component.ts
import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe, NgClass } from '@angular/common';
import { VentaService } from '../../core/services/venta.service';
import { ClienteService } from '../../core/services/cliente.service';
import { CajeroService } from '../../core/services/cajero.service';
import { ProductoService } from '../../core/services/producto.service';
import { CategoriaService } from '../../core/services/categoria.service';
import { Venta, Cliente, Cajero, Producto, Categoria, CrearVentaRequest } from '../../core/models/models';
import { AuthService } from '../../core/auth/auth.service';

interface LineaDetalle {
  productoId: number | null;
  cantidad: number;
}

@Component({
  selector: 'app-ventas',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, DatePipe, NgClass],
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
                        @case ('FINALIZADA')  { <span class="badge bg-success">✅ Finalizada</span> }
                        @case ('COMPLETADO')  { <span class="badge bg-success">✅ Completado</span> }
                        @case ('PENDIENTE')   { <span class="badge bg-warning text-dark">⏳ Pendiente</span> }
                        @case ('CANCELADA')   { <span class="badge bg-danger">❌ Cancelada</span> }
                        @default              { <span class="badge bg-secondary">{{ v.estado }}</span> }
                      }
                    </td>
                    <td class="text-center">
                      @if (v.estado === 'FINALIZADA' || v.estado === 'COMPLETADO' || v.estado === 'PENDIENTE') {
                        <button class="btn btn-sm btn-danger me-1" (click)="anularVenta(v.id!)" title="Anular">
                          <i class="bi bi-x-circle"></i>
                        </button>
                      }
                      @if (v.estado === 'FINALIZADA' || v.estado === 'COMPLETADO') {
                        <button class="btn btn-sm btn-info text-white" (click)="imprimirBoleta(v)" title="Imprimir boleta">
                          <i class="bi bi-printer"></i>
                        </button>
                      }
                      @if (v.estado === 'CANCELADA') {
                        <span class="badge bg-secondary">Anulada</span>
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

      <!-- FORMULARIO DE NUEVA VENTA -->
      @if (mostrarFormulario()) {
        <div class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.5)">
          <div class="modal-dialog modal-lg">
            <div class="modal-content">
              <div class="modal-header text-white" style="background:#2E7D32;">
                <h5 class="modal-title"><i class="bi bi-cart-plus"></i> Nueva Venta</h5>
                <button type="button" class="btn-close btn-close-white" (click)="cerrarFormulario()"></button>
              </div>
              <div class="modal-body">
                <form (ngSubmit)="abrirPago()">
                  <div class="row mb-3">
                    <!-- ===== CLIENTE: buscador en vivo + dropdown ===== -->
                    <div class="col-md-6 mb-3">
                      <label class="form-label fw-bold">Cliente</label>
                      <div class="position-relative">
                        <input type="text"
                               class="form-control"
                               placeholder="Buscar por nombre, apellido o DNI..."
                               [ngModel]="clienteSearch()"
                               (ngModelChange)="clienteSearch.set($event)"
                               name="clienteSearch"
                               (focus)="clienteDropdownOpen.set(true)"
                               (blur)="onClienteBlur()">
                        @if (clienteDropdownOpen() && (clientesFiltrados().length > 0)) {
                          <div class="position-absolute bg-white border shadow w-100"
                               style="z-index: 1080; max-height: 240px; overflow-y: auto; border-radius: 0 0 8px 8px;">
                            @for (c of clientesFiltrados(); track c.id) {
                              <button type="button"
                                      class="btn btn-link text-start text-decoration-none w-100 border-0 rounded-0 py-2"
                                      (mousedown)="seleccionarCliente(c)">
                                <strong>{{ c.nombres }} {{ c.apellidos }}</strong>
                                <small class="text-muted d-block">DNI: {{ c.dni }} · Tel: {{ c.telefono || '—' }}</small>
                              </button>
                            }
                          </div>
                        }
                      </div>

                      <!-- Cliente seleccionado visible -->
                      @if (nuevaVenta.clienteId && nuevaVenta.clienteId !== 0) {
                        <div class="mt-2 p-2 bg-light rounded border">
                          <span class="text-success fw-bold">
                            ✓ {{ clienteSeleccionado()?.nombres }} {{ clienteSeleccionado()?.apellidos }}
                          </span>
                          <button type="button" class="btn btn-sm btn-link text-danger p-0 ms-2"
                                  (click)="limpiarClienteSeleccion()">Cambiar</button>
                        </div>
                      }
                    </div>

                    <!-- ===== CAJERO ===== -->
                    <div class="col-md-6 mb-3">
                      <label class="form-label fw-bold">Cajero</label>
                      @if (auth.puedeGestionarProductos()) {
                        <select class="form-select" [(ngModel)]="nuevaVenta.cajeroId" name="cajeroId" required>
                          <option [ngValue]="0">Seleccione...</option>
                          @for (c of cajeros(); track c.id) {
                            <option [ngValue]="c.id">{{ c.nombres }} {{ c.apellidos }}</option>
                          }
                        </select>
                      } @else {
                        <input type="text" class="form-control"
                               [value]="auth.nombreCompleto()"
                               readonly disabled>
                        <input type="hidden" [value]="nuevaVenta.cajeroId">
                        <small class="text-muted">Cajero asignado automáticamente según tu sesión.</small>
                      }
                    </div>
                  </div>

                  <!-- ===== PANEL: ÚLTIMAS COMPRAS DEL CLIENTE ===== -->
                  @if (nuevaVenta.clienteId && ultimaVentasCliente().length > 0) {
                    <div class="card mb-3 border-info">
                      <div class="card-header bg-info bg-opacity-10 py-2">
                        <i class="bi bi-clock-history"></i>
                        <strong>Últimas compras de {{ clienteSeleccionado()?.nombres }}</strong>
                        <small class="text-muted">({{ ultimaVentasCliente().length }} más recientes)</small>
                      </div>
                      <div class="card-body p-2">
                        <ul class="list-group list-group-flush small">
                          @for (v of ultimaVentasCliente(); track v.id) {
                            <li class="list-group-item d-flex justify-content-between align-items-center px-0 py-1">
                              <span>
                                <i class="bi bi-calendar3"></i>
                                {{ v.fechaRegistro | date:'yyyy-MM-dd HH:mm' }}
                              </span>
                              <span class="fw-bold">S/. {{ v.total }}</span>
                              <span>
                                @switch (v.estado) {
                                  @case ('FINALIZADA') { <span class="badge bg-success">Finalizada</span> }
                                  @case ('COMPLETADO') { <span class="badge bg-success">Completado</span> }
                                  @case ('CANCELADA')  { <span class="badge bg-danger">Cancelada</span> }
                                  @default             { <span class="badge bg-secondary">{{ v.estado }}</span> }
                                }
                              </span>
                            </li>
                          }
                        </ul>
                      </div>
                    </div>
                  }

                  <!-- ===== PRODUCTOS A VENDER ===== -->
                  <hr>
                  <h6 class="fw-bold mb-3">
                    <i class="bi bi-list-check"></i> Productos a vender
                    <button type="button" class="btn btn-sm btn-outline-secondary ms-2"
                            (click)="mostrarCatalogo.set(!mostrarCatalogo())">
                      <i class="bi bi-search"></i> Catálogo
                    </button>
                  </h6>

                  <!-- Catálogo colapsable con buscador + filtro de categoría -->
                  @if (mostrarCatalogo()) {
                    <div class="card mb-3 bg-light">
                      <div class="card-body">
                        <div class="row mb-2 g-2">
                          <div class="col-md-7">
                            <div class="input-group input-group-sm">
                              <span class="input-group-text"><i class="bi bi-search"></i></span>
                              <input type="text" class="form-control"
                                     placeholder="Buscar producto por nombre o código..."
                                     [ngModel]="productoSearch()"
                                     (ngModelChange)="productoSearch.set($event)"
                                     name="productoSearch">
                            </div>
                          </div>
                          <div class="col-md-5">
                            <select class="form-select form-select-sm"
                                    [ngModel]="categoriaFilter()"
                                    (ngModelChange)="categoriaFilter.set($event)"
                                    name="categoriaFilter">
                              <option [ngValue]="0">Todas las categorías</option>
                              @for (cat of categorias(); track cat.idCategoria) {
                                <option [ngValue]="cat.idCategoria">{{ cat.nombre }}</option>
                              }
                            </select>
                          </div>
                        </div>

                        <div class="row g-2" style="max-height: 280px; overflow-y: auto;">
                          @for (p of productosFiltrados(); track p.idProducto) {
                            <div class="col-md-6">
                              <button type="button"
                                      class="btn btn-outline-success btn-sm w-100 text-start"
                                      [disabled]="(p.stock ?? 0) <= 0"
                                      (click)="agregarProductoACarrito(p)">
                                <span class="fw-bold">{{ p.codigo }}</span> - {{ p.nombre }}
                                <span class="badge bg-secondary float-end">S/. {{ p.precio }}</span>
                                <small class="d-block text-muted">
                                  Stock: {{ p.stock }}
                                  @if (p.categoria) { · {{ p.categoria.nombre }} }
                                </small>
                              </button>
                            </div>
                          } @empty {
                            <div class="col-12 text-center text-muted py-3">
                              <i class="bi bi-emoji-frown"></i> No se encontraron productos con ese filtro.
                            </div>
                          }
                        </div>
                      </div>
                    </div>
                  }

                  <!-- Tabla de líneas agregadas -->
                  @for (linea of lineasDetalle(); track $index; let i = $index) {
                    <div class="row mb-2 align-items-end">
                      <div class="col-md-4">
                        <label class="form-label fw-bold small">Producto</label>
                        <input type="text" class="form-control"
                               [value]="nombreProducto(linea.productoId)"
                               readonly disabled
                               placeholder="Seleccione del catálogo ↑">
                      </div>

                      <div class="col-md-2">
                        <label class="form-label fw-bold small">Stock</label>
                        <input type="text" class="form-control"
                               [value]="obtenerStock(linea.productoId)"
                               readonly disabled>
                      </div>

                      <div class="col-md-2">
                        <label class="form-label fw-bold small">Precio (S/.)</label>
                        <input type="text" class="form-control"
                               [value]="obtenerPrecio(linea.productoId)"
                               readonly disabled>
                      </div>

                      <div class="col-md-2">
                        <label class="form-label fw-bold small">Cantidad</label>
                        <input type="number" class="form-control"
                               [(ngModel)]="linea.cantidad"
                               [name]="'cantidad' + i" min="1" value="1" required>
                      </div>

                      <div class="col-md-2">
                        <button type="button" class="btn btn-danger btn-sm w-100"
                                (click)="eliminarLinea(i)"
                                [disabled]="lineasDetalle().length === 1">
                          <i class="bi bi-dash"></i>
                        </button>
                      </div>
                    </div>
                  }

                  <button type="button" class="btn btn-outline-success btn-sm mb-3"
                          (click)="agregarLinea()">
                    <i class="bi bi-plus-circle"></i> Agregar línea vacía
                  </button>

                  <div class="alert alert-success text-end fw-bold">
                    Total: S/. {{ calcularTotal() }}
                  </div>

                  <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" (click)="cerrarFormulario()">Cancelar</button>
                    <button type="submit" class="btn btn-success" [disabled]="guardando()">
                      @if (guardando()) {
                        <span class="spinner-border spinner-border-sm"></span> Procesando...
                      } @else {
                        <i class="bi bi-credit-card"></i> Pagar
                      }
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- MODAL DE PAGO -->
      @if (mostrarModalPago()) {
        <div class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.6); z-index: 1050;">
          <div class="modal-dialog modal-md modal-dialog-centered">
            <div class="modal-content shadow-lg" style="border-radius: 20px;">
              <div class="modal-header text-white" style="background: linear-gradient(135deg, #1B5E20, #2E7D32); border-radius: 20px 20px 0 0;">
                <h5 class="modal-title fw-bold">
                  <i class="bi bi-credit-card-2-front me-2"></i> Método de Pago
                </h5>
                <button type="button" class="btn-close btn-close-white" (click)="cerrarModalPago()"></button>
              </div>
              <div class="modal-body text-center py-4">

                <div class="mb-4 p-3 bg-success bg-opacity-10 rounded-3">
                  <h4 class="mb-0">
                    Total a pagar: <span class="text-success fw-bold">S/. {{ calcularTotal() }}</span>
                  </h4>
                </div>

                <!-- PASO 1: ELEGIR MÉTODO -->
                @if (!tipoPagoSeleccionado() && !procesandoPago() && !ventaConfirmada()) {
                  <div class="row g-3 justify-content-center">
                    <div class="col-5">
                      <button class="btn btn-success w-100 py-4" (click)="seleccionarPago('EFECTIVO')"
                              style="border-radius: 15px; transition: all 0.3s;">
                        <div class="d-flex flex-column align-items-center">
                          <i class="bi bi-cash-coin" style="font-size: 3rem;"></i>
                          <strong class="mt-2">Efectivo</strong>
                        </div>
                      </button>
                    </div>

                    <div class="col-5">
                      <button class="btn btn-primary w-100 py-4" (click)="seleccionarPago('QR')"
                              style="border-radius: 15px; transition: all 0.3s;">
                        <div class="d-flex flex-column align-items-center">
                          <i class="bi bi-qr-code" style="font-size: 3rem;"></i>
                          <strong class="mt-2">Pago con QR</strong>
                        </div>
                      </button>
                    </div>
                  </div>
                }

                <!-- PASO 2: SIMULACIÓN EFECTIVO -->
                @if (tipoPagoSeleccionado() === 'EFECTIVO' && !procesandoPago() && !ventaConfirmada()) {
                  <div class="mt-4 pt-3 border-top">
                    <h5 class="mb-3 text-success fw-bold">
                      <i class="bi bi-cash-coin me-2"></i>Simulación de pago en efectivo
                    </h5>

                    <div class="mb-3 text-start">
                      <label class="form-label fw-bold">Monto recibido (S/.)</label>
                      <input type="number" class="form-control form-control-lg text-center fw-bold"
                             [ngModel]="montoRecibido()"
                             (ngModelChange)="montoRecibido.set(+$event)"
                             name="montoRecibido" min="0" step="0.01" placeholder="0.00">
                    </div>

                    <div class="alert py-2"
                         [ngClass]="vuelto() >= 0 ? 'alert-success' : 'alert-warning'">
                      <strong>Vuelto: S/. {{ vuelto() }}</strong>
                    </div>

                    <button class="btn btn-success btn-lg mt-2 px-5 py-3 fw-bold"
                            (click)="confirmarPagoEfectivo()"
                            [disabled]="montoRecibido() <= 0 || montoRecibido() < calcularTotal()"
                            style="border-radius: 50px; box-shadow: 0 4px 15px rgba(46, 125, 50, 0.4);">
                      <i class="bi bi-check-circle-fill me-2"></i> Confirmar pago
                    </button>

                    <button class="btn btn-outline-secondary mt-2 px-4" (click)="seleccionarPago('')">
                      <i class="bi bi-arrow-left me-1"></i> Volver
                    </button>
                  </div>
                }

                <!-- PASO 2: SIMULACIÓN QR -->
                @if (tipoPagoSeleccionado() === 'QR' && mostrarQR() && !procesandoPago() && !ventaConfirmada()) {
                  <div class="mt-4 pt-3 border-top">
                    <h5 class="mb-3 text-primary">Selecciona el servicio</h5>

                    <div class="mb-4">
                      <div class="btn-group w-100" role="group" style="border-radius: 10px; overflow: hidden;">
                        <input type="radio" class="btn-check" name="metodoQR" id="yape"
                               [ngModel]="metodoQR()" (ngModelChange)="metodoQR.set('YAPE')" value="YAPE">
                        <label class="btn fw-bold py-2" for="yape"
                               style="color: #7B1FA2; border: 2px solid #7B1FA2; background: transparent; transition: all 0.3s;">Yape</label>

                        <input type="radio" class="btn-check" name="metodoQR" id="plin"
                               [ngModel]="metodoQR()" (ngModelChange)="metodoQR.set('PLIN')" value="PLIN">
                        <label class="btn fw-bold py-2" for="plin"
                               style="color: #197687; border: 2px solid #198754; background: transparent; transition: all 0.3s;">Plin</label>

                        <input type="radio" class="btn-check" name="metodoQR" id="sip"
                               [ngModel]="metodoQR()" (ngModelChange)="metodoQR.set('SIP')" value="SIP">
                        <label class="btn fw-bold py-2" for="sip"
                               style="color: #0dcaf0; border: 2px solid #0dcaf0; background: transparent; transition: all 0.3s;">SIP</label>
                      </div>
                    </div>

                    <div class="qr-container p-4 bg-white d-inline-block rounded-3 shadow-sm mx-auto"
                         style="border: 3px solid #2E7D32;">
                      <img [src]="getQrImage()" [alt]="'QR ' + metodoQR()"
                           class="img-fluid" style="width: 60%; border-radius: 15px;">
                    </div>

                    <div class="mt-3">
                      <div class="alert alert-info py-2" role="alert">
                        <i class="bi bi-info-circle me-2"></i>
                        Escanea el QR con <strong class="text-primary">{{ metodoQR() }}</strong>
                      </div>
                    </div>

                    <button class="btn btn-success btn-lg mt-3 px-5 py-3 fw-bold"
                            (click)="confirmarPagoQR()"
                            style="border-radius: 50px; box-shadow: 0 4px 15px rgba(46, 125, 50, 0.4);">
                      <i class="bi bi-check-circle-fill me-2"></i> ✅ Confirmar pago realizado
                    </button>

                    <button class="btn btn-outline-secondary mt-2 px-4" (click)="seleccionarPago('')">
                      <i class="bi bi-arrow-left me-1"></i> Volver
                    </button>
                  </div>
                }

                <!-- PASO 3: PROCESANDO PAGO -->
                @if (procesandoPago()) {
                  <div class="py-5">
                    <div class="spinner-border text-success" style="width: 4rem; height: 4rem;" role="status"></div>
                    <h5 class="mt-4 fw-bold">
                      Procesando pago {{ metodoPagoEnCurso() }}...
                    </h5>
                    <p class="text-muted">Simulando la confirmación del pago...</p>
                  </div>
                }

                <!-- PASO 4: PAGO CONFIRMADO -->
                @if (ventaConfirmada()) {
                  <div class="py-4">
                    <i class="bi bi-check-circle-fill text-success" style="font-size: 5rem;"></i>
                    <h4 class="fw-bold mt-3">¡Pago confirmado!</h4>
                    <p class="mb-1">
                      Venta <strong>#{{ ventaConfirmada()!.id }}</strong> finalizada
                      por <strong>{{ ventaConfirmada()!.metodoPago }}</strong>
                    </p>
                    <p class="text-muted">Monto: S/. {{ ventaConfirmada()!.total }}</p>

                    <button class="btn btn-info text-white btn-lg mt-3 px-4 fw-bold"
                            (click)="imprimirBoleta(ventaConfirmada()!)"
                            style="border-radius: 50px;">
                      <i class="bi bi-printer me-2"></i> Imprimir boleta
                    </button>
                    <br>
                    <button class="btn btn-outline-success mt-2 px-4" (click)="nuevaVentaTrasPago()">
                      <i class="bi bi-plus-circle me-1"></i> Nueva venta
                    </button>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .qr-container { background: white; border-radius: 15px; border: 3px solid #2E7D32; box-shadow: 0 8px 25px rgba(0,0,0,0.1); }
    .modal-dialog-centered { display: flex; align-items: center; min-height: calc(100% - 1rem); }
    .btn-check:checked + .btn { color: white !important; }
    .btn-check:checked + .btn[style*="#7B1FA2"] { background-color: #7B1FA2 !important; border-color: #7B1FA2 !important; }
    .btn-check:checked + .btn[style*="#198754"] { background-color: #198754 !important; border-color: #198754 !important; }
    .btn-check:checked + .btn[style*="#0dcaf0"] { background-color: #0dcaf0 !important; border-color: #0dcaf0 !important; }
  `]
})
export class VentasComponent implements OnInit {
  private ventaService = inject(VentaService);
  private clienteService = inject(ClienteService);
  private cajeroService = inject(CajeroService);
  private productoService = inject(ProductoService);
  private categoriaService = inject(CategoriaService);
  protected auth = inject(AuthService);

  // ========== SIGNALS ==========
  ventas = signal<Venta[]>([]);
  clientes = signal<Cliente[]>([]);
  cajeros = signal<Cajero[]>([]);
  productos = signal<Producto[]>([]);
  categorias = signal<Categoria[]>([]);

  cargando = signal(true);
  guardando = signal(false);
  mostrarFormulario = signal(false);
  mensaje = signal('');
  error = signal('');

  // Estado del pago
  mostrarModalPago = signal(false);
  mostrarQR = signal(false);
  mostrarPagoEfectivo = signal(false);
  tipoPagoSeleccionado = signal<string | null>(null);
  metodoQR = signal<string>('YAPE');
  montoRecibido = signal<number>(0);
  procesandoPago = signal(false);
  ventaConfirmada = signal<Venta | null>(null);
  metodoPagoEnCurso = signal('');

  vuelto = computed(() => {
    const total = this.calcularTotal();
    const recibido = this.montoRecibido() || 0;
    return Math.round((recibido - total) * 100) / 100;
  });

  nuevaVenta: CrearVentaRequest = { clienteId: 0, cajeroId: 0, productos: [] };
  lineasDetalle = signal<LineaDetalle[]>([{ productoId: null, cantidad: 1 }]);

  // ===== NUEVO: Búsqueda de cliente + productos =====
  clienteSearch = signal('');
  clienteDropdownOpen = signal(false);
  clienteSeleccionado = signal<Cliente | null>(null);
  ultimaVentasCliente = signal<Venta[]>([]);

  productoSearch = signal('');
  categoriaFilter = signal<number>(0);
  mostrarCatalogo = signal(true);

  // ===== COMPUTED: listas filtradas =====
  clientesFiltrados = computed(() => {
    const q = this.clienteSearch().toLowerCase().trim();
    if (!q) return this.clientes();
    return this.clientes().filter(c =>
      (c.nombres + ' ' + c.apellidos).toLowerCase().includes(q) ||
      (c.dni || '').includes(q)
    );
  });

  productosFiltrados = computed(() => {
    const q = this.productoSearch().toLowerCase().trim();
    const catId = this.categoriaFilter();
    return this.productos().filter(p => {
      const matchesText = !q ||
        p.nombre.toLowerCase().includes(q) ||
        p.codigo.toLowerCase().includes(q);
      const matchesCat = catId === 0 || (p.categoria?.idCategoria === catId);
      return matchesText && matchesCat;
    });
  });

  // ========== QR IMAGES ==========
  qrImages = {
    YAPE: '/assets/images/qr-yape.jpg',
    PLIN: '/assets/images/qr-plin.jpg',
    SIP:  '/assets/images/qr-sip.jpg'
  };

  // ========== LIFECYCLE ==========
  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.ventaService.listar().subscribe({
      next: (data) => {
        this.ventas.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error(err);
        this.cargando.set(false);
      }
    });
    this.clienteService.listar().subscribe(d => this.clientes.set(d));
    this.cajeroService.listar().subscribe(d => this.cajeros.set(d));
    this.productoService.listar().subscribe(d => this.productos.set(d));
    this.categoriaService.listar().subscribe(d => this.categorias.set(d));
  }

  // ========== CÁLCULOS ==========
  calcularTotal(): number {
    let total = 0;
    for (const linea of this.lineasDetalle()) {
      if (linea.productoId) {
        const producto = this.productos().find(p => p.idProducto === linea.productoId);
        if (producto) {
          total += producto.precio * (linea.cantidad || 0);
        }
      }
    }
    return Math.round(total * 100) / 100;
  }

  obtenerPrecio(productoId: number | null): string {
    if (!productoId) return '';
    const producto = this.productos().find(p => p.idProducto === productoId);
    return producto ? producto.precio.toFixed(2) : '';
  }

  obtenerStock(productoId: number | null): string {
    if (!productoId) return '';
    const producto = this.productos().find(p => p.idProducto === productoId);
    return producto ? (producto.stock ?? 0).toString() : '';
  }

  nombreProducto(productoId: number | null): string {
    if (!productoId) return '';
    const p = this.productos().find(x => x.idProducto === productoId);
    return p ? `${p.codigo} - ${p.nombre}` : '';
  }

  getQrImage(): string {
    const metodo = this.metodoQR() || 'YAPE';
    return this.qrImages[metodo as keyof typeof this.qrImages] || this.qrImages.YAPE;
  }

  // ========== CLIENTE (búsqueda + selección) ==========
  onClienteBlur(): void {
    // Delay para permitir mousedown en opciones
    setTimeout(() => this.clienteDropdownOpen.set(false), 200);
  }

  seleccionarCliente(c: Cliente): void {
    this.nuevaVenta.clienteId = c.id!;
    this.clienteSeleccionado.set(c);
    this.clienteSearch.set(`${c.nombres} ${c.apellidos}`);
    this.clienteDropdownOpen.set(false);
    this.cargarUltimasVentas(c.id!);
  }

  limpiarClienteSeleccion(): void {
    this.nuevaVenta.clienteId = 0;
    this.clienteSeleccionado.set(null);
    this.clienteSearch.set('');
    this.ultimaVentasCliente.set([]);
  }

  private cargarUltimasVentas(clienteId: number): void {
    this.clienteService.ultimasVentas(clienteId).subscribe({
      next: (data) => this.ultimaVentasCliente.set(data),
      error: (err) => {
        console.error('Error al cargar últimas ventas del cliente', err);
        this.ultimaVentasCliente.set([]);
      }
    });
  }

  // ========== CATÁLOGO (filtrado + agregar al carrito) ==========
  agregarProductoACarrito(p: Producto): void {
    // Si el producto ya está en el carrito, le suma 1 a la cantidad
    const existente = this.lineasDetalle().find(l => l.productoId === p.idProducto);
    if (existente) {
      existente.cantidad = (existente.cantidad || 0) + 1;
      this.lineasDetalle.update(arr => [...arr]);
      return;
    }
    // Si hay una línea vacía al final, la rellena
    const lineas = this.lineasDetalle();
    const ultima = lineas[lineas.length - 1];
    if (ultima && ultima.productoId === null) {
      ultima.productoId = p.idProducto!;
      ultima.cantidad = 1;
      this.lineasDetalle.update(arr => [...arr]);
      return;
    }
    // Si no, agrega una nueva
    this.lineasDetalle.update(arr => [...arr, { productoId: p.idProducto!, cantidad: 1 }]);
  }

  // ========== FORMULARIO ==========
  abrirFormulario(): void {
    const cajeroIdInicial = (this.auth.esCajero() && this.auth.empleadoId())
      ? this.auth.empleadoId()!
      : 0;
    this.nuevaVenta = { clienteId: 0, cajeroId: cajeroIdInicial, productos: [] };
    this.lineasDetalle.set([{ productoId: null, cantidad: 1 }]);
    this.clienteSearch.set('');
    this.clienteSeleccionado.set(null);
    this.ultimaVentasCliente.set([]);
    this.productoSearch.set('');
    this.categoriaFilter.set(0);
    this.mostrarCatalogo.set(true);
    this.mostrarFormulario.set(true);
    this.mostrarModalPago.set(false);
    this.mostrarQR.set(false);
    this.tipoPagoSeleccionado.set(null);
    this.metodoQR.set('YAPE');
  }

  cerrarFormulario(): void {
    this.mostrarFormulario.set(false);
    this.mostrarModalPago.set(false);
    this.mostrarQR.set(false);
  }

  agregarLinea(): void {
    this.lineasDetalle.update(lines => [...lines, { productoId: null, cantidad: 1 }]);
  }

  eliminarLinea(i: number): void {
    this.lineasDetalle.update(lines => lines.filter((_, idx) => idx !== i));
  }

  // ========== VALIDAR VENTA ==========
  validarVenta(): boolean {
    this.error.set('');

    if (!this.nuevaVenta.clienteId || this.nuevaVenta.clienteId === 0) {
      this.error.set('Debe seleccionar un cliente.');
      return false;
    }
    if (!this.nuevaVenta.cajeroId || this.nuevaVenta.cajeroId === 0) {
      this.error.set('Debe seleccionar un cajero.');
      return false;
    }

    const lineasValidas = this.lineasDetalle().filter(l => l.productoId && l.cantidad > 0);
    if (lineasValidas.length === 0) {
      this.error.set('Debe agregar al menos un producto con cantidad mayor a 0.');
      return false;
    }

    for (const linea of lineasValidas) {
      const producto = this.productos().find(p => p.idProducto === linea.productoId);
      if (producto) {
        const stockActual = producto.stock ?? 0;
        const cantidadSolicitada = linea.cantidad || 0;
        if (stockActual < cantidadSolicitada) {
          this.error.set(`Stock insuficiente para "${producto.nombre}". Stock: ${stockActual}`);
          return false;
        }
      }
    }

    return true;
  }

  // ========== PROCESO DE PAGO ==========
  abrirPago(): void {
    if (!this.validarVenta()) return;

    this.mostrarFormulario.set(false);
    this.mostrarModalPago.set(true);
    this.mostrarQR.set(false);
    this.mostrarPagoEfectivo.set(false);
    this.tipoPagoSeleccionado.set(null);
    this.metodoQR.set('YAPE');
    this.montoRecibido.set(0);
    this.procesandoPago.set(false);
    this.ventaConfirmada.set(null);
  }

  cerrarModalPago(): void {
    if (this.ventaConfirmada()) {
      this.nuevaVentaTrasPago();
      return;
    }
    this.mostrarModalPago.set(false);
    this.mostrarQR.set(false);
    this.mostrarPagoEfectivo.set(false);
    this.tipoPagoSeleccionado.set(null);
    this.procesandoPago.set(false);
    this.mostrarFormulario.set(true);
  }

  seleccionarPago(tipo: string): void {
    this.tipoPagoSeleccionado.set(tipo);
    if (tipo === 'EFECTIVO') {
      this.mostrarQR.set(false);
      this.mostrarPagoEfectivo.set(true);
      this.montoRecibido.set(0);
    } else if (tipo === 'QR') {
      this.mostrarPagoEfectivo.set(false);
      this.mostrarQR.set(true);
    } else {
      this.mostrarQR.set(false);
      this.mostrarPagoEfectivo.set(false);
    }
  }

  confirmarPagoEfectivo(): void {
    const total = this.calcularTotal();
    const recibido = this.montoRecibido() || 0;
    if (recibido < total) {
      this.error.set(`El monto recibido (S/. ${recibido}) es menor al total (S/. ${total}).`);
      return;
    }
    this.metodoPagoEnCurso.set('EFECTIVO');
    this.procesandoPago.set(true);
    setTimeout(() => this.guardarVenta('EFECTIVO', recibido), 1800);
  }

  confirmarPagoQR(): void {
    const metodo = this.metodoQR() || 'YAPE';
    this.metodoPagoEnCurso.set(metodo);
    this.procesandoPago.set(true);
    this.mostrarQR.set(false);
    setTimeout(() => this.guardarVenta(metodo, 0), 1800);
  }

  // ========== GUARDAR VENTA (PENDIENTE) + CONFIRMAR PAGO (FINALIZADA) ==========
  guardarVenta(metodoPago: string, montoRecibido: number): void {
    this.error.set('');
    this.mensaje.set('');

    const lineasValidas = this.lineasDetalle().filter(l => l.productoId && l.cantidad > 0);
    this.nuevaVenta.productos = lineasValidas.map(l => ({
      productoId: l.productoId!,
      cantidad: l.cantidad
    }));

    this.guardando.set(true);
    this.ventaService.crear(this.nuevaVenta).subscribe({
      next: (venta) => {
        this.ventaService.confirmarPago(venta.id!, metodoPago, montoRecibido).subscribe({
          next: (ventaFinal) => {
            this.guardando.set(false);
            this.procesandoPago.set(false);
            this.ventaConfirmada.set(ventaFinal);
            this.mensaje.set(`✅ Venta #${ventaFinal.id} registrada y pagada (${metodoPago}).`);
            this.ventaService.listar().subscribe({
              next: (data) => this.ventas.set(data),
              error: (err) => console.error(err)
            });
          },
          error: (err) => {
            this.guardando.set(false);
            this.procesandoPago.set(false);
            const msg = err.error?.mensaje || err.error?.message || err.error || err.message;
            this.error.set(typeof msg === 'string' ? msg : 'Error al confirmar el pago');
            this.mostrarFormulario.set(true);
            this.mostrarModalPago.set(false);
          }
        });
      },
      error: (err) => {
        this.guardando.set(false);
        this.procesandoPago.set(false);
        const msg = err.error?.mensaje || err.error?.message || err.error || err.message;
        this.error.set(typeof msg === 'string' ? msg : 'Error al crear la venta');
        this.mostrarFormulario.set(true);
        this.mostrarModalPago.set(false);
      }
    });
  }

  nuevaVentaTrasPago(): void {
    this.mostrarModalPago.set(false);
    this.mostrarQR.set(false);
    this.mostrarPagoEfectivo.set(false);
    this.procesandoPago.set(false);
    this.ventaConfirmada.set(null);
    this.tipoPagoSeleccionado.set(null);
    this.montoRecibido.set(0);
    this.abrirFormulario();
  }

  // ========== ANULAR VENTA ==========
  anularVenta(id: number): void {
    if (!confirm('¿Estás seguro de anular esta venta? Se devolverá el stock.')) return;

    this.ventaService.anular(id).subscribe({
      next: () => {
        this.mensaje.set('✅ Venta anulada correctamente. Stock devuelto.');
        this.ventaService.listar().subscribe({
          next: (data) => this.ventas.set(data),
          error: (err) => console.error(err)
        });
      },
      error: (err) => {
        const msg = err.error?.message || err.error || err.message || 'Error al anular la venta';
        this.error.set(typeof msg === 'string' ? msg : 'Error al anular la venta');
        console.error('Error al anular:', err);
      }
    });
  }

  // ========== IMPRIMIR BOLETA ==========
  imprimirBoleta(v: Venta): void {
    const fechaStr = v.fechaRegistro ? new Date(v.fechaRegistro).toLocaleString('es-PE') : '';
    const estadoStr = v.estado || '';
    const clienteStr = v.cliente ? `${v.cliente.nombres} ${v.cliente.apellidos}` : 'Cliente no registrado';
    const dniStr = v.cliente?.dni || '—';
    const cajeroStr = v.cajero ? `${v.cajero.nombres} ${v.cajero.apellidos}` : '—';
    const metodoStr = v.metodoPago || '—';
    const montoRecibido = v.montoRecibido ?? 0;
    const total = v.total ?? 0;
    const vuelto = Math.round((montoRecibido - total) * 100) / 100;

    const win = window.open('', '_blank', 'width=400,height=600');
    if (!win) {
      this.error.set('El navegador bloqueó la apertura de la ventana de boleta. Permití pop-ups.');
      return;
    }

    win.document.write(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Boleta #${v.id}</title>
        <style>
          * { font-family: 'Courier New', monospace; box-sizing: border-box; }
          body { width: 320px; margin: 0 auto; padding: 12px; color: #000; }
          h1 { font-size: 16px; text-align: center; margin: 0 0 4px 0; }
          .subtitle { text-align: center; font-size: 11px; margin-bottom: 12px; color: #555; }
          hr { border: none; border-top: 1px dashed #000; margin: 8px 0; }
          .row { display: flex; justify-content: space-between; font-size: 12px; margin: 2px 0; }
          .total { font-weight: bold; font-size: 14px; }
          .footer { text-align: center; font-size: 10px; margin-top: 12px; color: #555; }
          .header-logo { text-align: center; margin-bottom: 8px; font-size: 24px; }
          .estado-badge { display: inline-block; padding: 2px 8px; border: 1px solid #000; border-radius: 3px; font-size: 10px; }
          @media print {
            body { width: auto; padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header-logo">🛒</div>
        <h1>MiniMarket Cibertec</h1>
        <div class="subtitle">Av. Lima 123 · Tel: 987654321</div>
        <hr>
        <div class="row"><span><strong>Boleta N°:</strong></span><span>${v.id}</span></div>
        <div class="row"><span><strong>Fecha:</strong></span><span>${fechaStr}</span></div>
        <div class="row"><span><strong>Estado:</strong></span><span class="estado-badge">${estadoStr}</span></div>
        <hr>
        <div class="row"><span><strong>Cliente:</strong></span><span>${clienteStr}</span></div>
        <div class="row"><span><strong>DNI:</strong></span><span>${dniStr}</span></div>
        <div class="row"><span><strong>Cajero:</strong></span><span>${cajeroStr}</span></div>
        <div class="row"><span><strong>Método de pago:</strong></span><span>${metodoStr}</span></div>
        ${
          metodoStr !== '—' && metodoStr !== 'EFECTIVO'
            ? ''
            : `<div class="row"><span><strong>Monto recibido:</strong></span><span>S/. ${montoRecibido}</span></div>
               <div class="row"><span><strong>Vuelto:</strong></span><span>S/. ${vuelto}</span></div>`
        }
        <hr>
        <div class="row"><span><strong>TOTAL:</strong></span><span class="total">S/. ${total}</span></div>
        <hr>
        <div class="footer">
          ¡Gracias por su compra!<br>
          Documento generado automáticamente - MiniMarket<br>
          ${new Date().toLocaleString('es-PE')}
        </div>
        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
      </html>
    `);
    win.document.close();
  }
}
