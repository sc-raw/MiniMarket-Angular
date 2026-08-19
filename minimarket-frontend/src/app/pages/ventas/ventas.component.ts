// ventas.component.ts
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
                        @case ('COMPLETADO') { <span class="badge bg-success">✅ Completado</span> }
                        @case ('CANCELADA') { <span class="badge bg-danger">❌ Cancelada</span> }
                        @default { <span class="badge bg-secondary">{{ v.estado }}</span> }
                      }
                    </td>

                    <td class="text-center">
      @if (v.estado === 'COMPLETADO' || v.estado === 'PENDIENTE') {
        <button class="btn btn-sm btn-danger" (click)="anularVenta(v.id!)" title="Anular">
          <i class="bi bi-x-circle"></i> Anular
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
                          <option [ngValue]="c.id">{{ c.nombres }}</option>
                        }
                      </select>
                    </div>
                  </div>

                  <!-- Productos a vender -->
                  <hr>
                  <h6 class="fw-bold mb-3"><i class="bi bi-list-check"></i> Productos a vender</h6>

                  @for (linea of lineasDetalle(); track $index; let i = $index) {
                    <div class="row mb-2 align-items-end">
                      <!-- Producto -->
                      <div class="col-md-4">
                        <label class="form-label fw-bold small">Producto</label>
                        <select class="form-select" [(ngModel)]="linea.productoId" [name]="'producto' + i" required>
                          <option [ngValue]="null">Seleccione producto...</option>
                          @for (p of productos(); track p.idProducto) {
                            <option [ngValue]="p.idProducto">
                              {{ p.codigo }} - {{ p.nombre }}
                            </option>
                          }
                        </select>
                      </div>

                      <!-- Stock (automático) -->
                      <div class="col-md-2">
                        <label class="form-label fw-bold small">Stock</label>
                        <input type="text" class="form-control" 
                              [value]="obtenerStock(linea.productoId)" 
                              readonly disabled>
                      </div>


                      <!-- Precio (automático) -->
                      <div class="col-md-2">
                        <label class="form-label fw-bold small">Precio (S/.)</label>
                        <input type="text" class="form-control" 
                              [value]="obtenerPrecio(linea.productoId)" 
                              readonly disabled>
                      </div>

                      <!-- Cantidad -->
                      <div class="col-md-2">
                        <label class="form-label fw-bold small">Cantidad</label>
                        <input type="number" class="form-control" [(ngModel)]="linea.cantidad"
                              [name]="'cantidad' + i" min="1" value="1" required>
                      </div>



                      <!-- Eliminar -->
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

                  <!-- Mostrar total calculado -->
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
                
                <!-- Mostrar monto -->
                <div class="mb-4 p-3 bg-success bg-opacity-10 rounded-3">
                  <h4 class="mb-0">
                    Total a pagar: <span class="text-success fw-bold">S/. {{ calcularTotal() }}</span>
                  </h4>
                </div>

                <!-- Botones de pago -->
                @if (!tipoPagoSeleccionado()) {
                  <div class="row g-3 justify-content-center">
                    <!-- Pago en Efectivo -->
                    <div class="col-5">
                      <button class="btn btn-success w-100 py-4" (click)="seleccionarPago('EFECTIVO')" 
                              style="border-radius: 15px; transition: all 0.3s;">
                        <div class="d-flex flex-column align-items-center">
                          <i class="bi bi-cash-coin" style="font-size: 3rem;"></i>
                          <strong class="mt-2">Efectivo</strong>
                        </div>
                      </button>
                    </div>
                    
                    <!-- Pago con QR -->
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

                <!-- Mostrar QR -->
                @if (mostrarQR()) {
                  <div class="mt-4 pt-3 border-top">
                    <h5 class="mb-3 text-primary">
                      <i></i> Selecciona el servicio
                    </h5>
                    
                    <!-- Selector de método QR -->
                    <div class="mb-4">
                      <div class="btn-group w-100" role="group" style="border-radius: 10px; overflow: hidden;">
                        <!-- Yape: Morado -->
                          <input type="radio" class="btn-check" name="metodoQR" id="yape"
                                [ngModel]="metodoQR()" (ngModelChange)="metodoQR.set('YAPE')" value="YAPE">
                          <label class="btn fw-bold py-2" for="yape"
                                style="color: #7B1FA2; border: 2px solid #7B1FA2; background: transparent; transition: all 0.3s;">
                            <i></i> Yape
                          </label>

                          <!-- Plin: Verde -->
                          <input type="radio" class="btn-check" name="metodoQR" id="plin" 
                                [ngModel]="metodoQR()" (ngModelChange)="metodoQR.set('PLIN')" value="PLIN">
                          <label class="btn fw-bold py-2" for="plin" 
                                style="color: #197687; border: 2px solid #198754; background: transparent; transition: all 0.3s;">
                            <i></i> Plin
                          </label>

                          <!-- SIP: Celeste -->
                          <input type="radio" class="btn-check" name="metodoQR" id="sip" 
                                [ngModel]="metodoQR()" (ngModelChange)="metodoQR.set('SIP')" value="SIP">
                          <label class="btn fw-bold py-2" for="sip"
                                style="color: #0dcaf0; border: 2px solid #0dcaf0; background: transparent; transition: all 0.3s;">
                            <i></i> SIP
                          </label>

                        
                      </div>
                    </div>

                    <!-- QR -->
                    <div class="qr-container p-4 bg-white d-inline-block rounded-3 shadow-sm mx-auto" 
                         style="border: 3px solid #2E7D32;">

                      <img 
                        [src]="getQrImage()" 
                        [alt]="'QR ' + metodoQR()"
                        class="img-fluid" 
                        style="width: 60%; border-radius: 15px;"
                    >
                    
                    </div>

                    <div class="mt-3">
                      <div class="alert alert-info py-2" role="alert">
                        <i class="bi bi-info-circle me-2"></i>
                        Escanea el QR con <strong class="text-primary">{{ metodoQR() }}</strong>
                      </div>
                    </div>

                    <!-- Botón Confirmar Pago -->
                    <button class="btn btn-success btn-lg mt-3 px-5 py-3 fw-bold" 
                            (click)="confirmarPagoQR()"
                            style="border-radius: 50px; box-shadow: 0 4px 15px rgba(46, 125, 50, 0.4);">
                      <i class="bi bi-check-circle-fill me-2"></i> ✅ Confirmar pago realizado
                    </button>
                    
                    <button class="btn btn-outline-secondary mt-2 px-4" (click)="cerrarModalPago()">
                      <i class="bi bi-arrow-left me-1"></i> Volver
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
    .qr-container {
      background: white;
      border-radius: 15px;
      border: 3px solid #2E7D32;
      box-shadow: 0 8px 25px rgba(0,0,0,0.1);
    }
    .modal-dialog-centered {
      display: flex;
      align-items: center;
      min-height: calc(100% - 1rem);
    }
    .btn-check:checked + .btn {
      color: white !important;
    }
    .btn-check:checked + .btn[style*="#7B1FA2"] {
      background-color: #7B1FA2 !important;
      border-color: #7B1FA2 !important;
    }
    .btn-check:checked + .btn[style*="#198754"] {
      background-color: #198754 !important;
      border-color: #198754 !important;
    }
    .btn-check:checked + .btn[style*="#0dcaf0"] {
      background-color: #0dcaf0 !important;
      border-color: #0dcaf0 !important;
    }
  `]
})
export class VentasComponent implements OnInit {
  private ventaService = inject(VentaService);
  private clienteService = inject(ClienteService);
  private cajeroService = inject(CajeroService);
  private productoService = inject(ProductoService);

  // ========== SIGNALS ==========
  ventas = signal<Venta[]>([]);
  clientes = signal<Cliente[]>([]);
  cajeros = signal<Cajero[]>([]);
  productos = signal<Producto[]>([]);

  cargando = signal(true);
  guardando = signal(false);
  mostrarFormulario = signal(false);
  mensaje = signal('');
  error = signal('');

  // Estado del pago
  mostrarModalPago = signal(false);
  mostrarQR = signal(false);
  tipoPagoSeleccionado = signal<string | null>(null);
  metodoQR = signal<string>('YAPE');

  nuevaVenta: CrearVentaRequest = { clienteId: 0, cajeroId: 0, productos: [] };
  lineasDetalle = signal<LineaDetalle[]>([{ productoId: null, cantidad: 1 }]);

  // ========== QR IMAGES ==========
  qrImages = {
    YAPE: '/assets/images/qr-yape.jpg',
    PLIN: '/assets/images/qr-plin.jpg',
    SIP: '/assets/images/qr-sip.jpg'
  };

  // ========== LIFECYCLE ==========
  ngOnInit(): void {
    this.cargarDatos();
  }

  // ========== CARGAR DATOS ==========
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
  }

  // ========== CALCULAR TOTAL ==========
  calcularTotal(): number {
    let total = 0;
    const lineas = this.lineasDetalle();
    for (const linea of lineas) {
      if (linea.productoId) {
        const producto = this.productos().find(p => p.idProducto === linea.productoId);
        if (producto) {
          total += producto.precio * (linea.cantidad || 0);
        }
      }
    }
    return Math.round(total * 100) / 100;
  }

  // ========== OBTENER QR ==========
  getQrImage(): string {
    const metodo = this.metodoQR() || 'YAPE';
    return this.qrImages[metodo as keyof typeof this.qrImages] || this.qrImages.YAPE;
  }

  // ========== FORMULARIO ==========
  abrirFormulario(): void {
    this.nuevaVenta = { clienteId: 0, cajeroId: 0, productos: [] };
    this.lineasDetalle.set([{ productoId: null, cantidad: 1 }]);
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
    if (!this.validarVenta()) {
      return;
    }
    
    this.mostrarFormulario.set(false);
    this.mostrarModalPago.set(true);
    this.mostrarQR.set(false);
    this.tipoPagoSeleccionado.set(null);
    this.metodoQR.set('YAPE');
  }

  cerrarModalPago(): void {
    this.mostrarModalPago.set(false);
    this.mostrarQR.set(false);
    this.tipoPagoSeleccionado.set(null);
    this.mostrarFormulario.set(true);
  }

  seleccionarPago(tipo: string): void {
    this.tipoPagoSeleccionado.set(tipo);
    
    if (tipo === 'EFECTIVO') {
      this.mostrarModalPago.set(false);
      this.guardarVenta();
    } else if (tipo === 'QR') {
      this.mostrarQR.set(true);
    }
  }

  confirmarPagoQR(): void {
    this.mostrarQR.set(false);
    this.mostrarModalPago.set(false);
    this.guardarVenta();
  }

  // ========== GUARDAR VENTA ==========
  guardarVenta(): void {
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
        this.guardando.set(false);
        this.mensaje.set(`✅ Venta #${venta.id} registrada correctamente.`);
        this.ventaService.listar().subscribe({
          next: (data) => this.ventas.set(data),
          error: (err) => console.error(err)
        });
        this.cerrarFormulario();
      },
      error: (err) => {
        this.guardando.set(false);
        const msg = err.error?.message || err.error || err.message || 'Error al crear la venta';
        this.error.set(typeof msg === 'string' ? msg : 'Error al crear la venta');
        this.mostrarFormulario.set(true);
      }
    });
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



  // ========== OBTENER PRECIO ==========
obtenerPrecio(productoId: number | null): string {
  if (!productoId) return '';
  const producto = this.productos().find(p => p.idProducto === productoId);
  return producto ? producto.precio.toFixed(2) : '';
}

// ========== OBTENER STOCK ==========
obtenerStock(productoId: number | null): string {
  if (!productoId) return '';
  const producto = this.productos().find(p => p.idProducto === productoId);
  return producto ? (producto.stock ?? 0).toString() : '';
}

  // ========== CAMBIAR ESTADO ==========
  cambiarEstado(idVenta: number, nuevoEstado: string): void {
    this.error.set('');
    this.mensaje.set('');
    
    this.ventaService.actualizarEstado(idVenta, nuevoEstado).subscribe({
      next: () => {
        this.mensaje.set(`✅ Estado actualizado a: ${nuevoEstado}`);
        this.ventaService.listar().subscribe({
          next: (data: Venta[]) => this.ventas.set(data),
          error: (err: any) => console.error('Error al recargar ventas:', err)
        });
      },
      error: (err: any) => {
        const msg = err.error?.message || err.error || err.message || 'Error al actualizar estado';
        this.error.set(typeof msg === 'string' ? msg : 'Error al actualizar estado');
        console.error('Error al cambiar estado:', err);
      }
    });
  }
}