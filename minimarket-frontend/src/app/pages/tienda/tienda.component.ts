import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { Producto, Venta } from '../../core/models/models';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-tienda',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container mt-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="mb-0">🛒 Tienda MiniMarket</h2>
        <a routerLink="/mis-pedidos" class="btn btn-outline-success">📦 Mis Pedidos</a>
      </div>

      <div class="row">
        <!-- LISTA DE PRODUCTOS -->
        <div class="col-md-8">
          <div class="row">
            @for (p of productos(); track p.idProducto) {
              <div class="col-md-4 mb-3">
                <div class="card h-100 shadow-sm">
                  <div class="card-body">
                    <h5 class="card-title">{{ p.nombre }}</h5>
                    <p class="text-muted small">{{ p.descripcion }}</p>
                    <h6 class="text-success">S/. {{ p.precio }}</h6>
                    <button class="btn btn-sm btn-primary w-100" (click)="agregarCarrito(p)"
                            [disabled]="(p.stock ?? 0) <= 0">
                      <i class="bi bi-cart-plus"></i>
                      @if ((p.stock ?? 0) > 0) { Agregar } @else { Sin stock }
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- CARRITO DE COMPRAS -->
        <div class="col-md-4">
          <div class="card shadow sticky-top" style="top: 20px;">
            <div class="card-header bg-dark text-white">
              <h5 class="mb-0">🛒 Carrito</h5>
            </div>
            <div class="card-body">
              @if (carrito().length === 0) {
                <p class="text-muted text-center">Tu carrito está vacío.</p>
              } @else {
                @for (item of carrito(); track item.producto.idProducto) {
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <div>
                      <strong>{{ item.producto.nombre }}</strong><br>
                      <small>S/. {{ item.producto.precio }} x
                        <input type="number" min="1" [(ngModel)]="item.cantidad"
                               style="width:60px; display:inline-block; padding:2px 6px;"
                               (ngModelChange)="recalcular()">
                      </small>
                    </div>
                    <button class="btn btn-danger btn-sm" (click)="quitarCarrito(item.producto)">✕</button>
                  </div>
                  <hr>
                }
                <h4 class="text-end">Total: S/. {{ total() }}</h4>

                <hr>
                <h6>📋 Datos del comprador</h6>
                @if (esClienteVinculado) {
                  <div class="alert alert-success py-2 small mb-2">
                    ✓ Datos cargados de tu cuenta.<br>
                    <strong>{{ nombresCliente }} {{ apellidosCliente }}</strong><br>
                    <small>DNI: {{ dniCliente }}</small>
                  </div>
                } @else {
                  <input type="text" class="form-control mb-2" placeholder="DNI (8 dígitos)"
                         [(ngModel)]="dniCliente" maxlength="8">
                  <input type="text" class="form-control mb-2" placeholder="Nombres"
                         [(ngModel)]="nombresCliente">
                  <input type="text" class="form-control mb-2" placeholder="Apellidos"
                         [(ngModel)]="apellidosCliente">
                }

                <button class="btn btn-success w-100 mt-2" (click)="abrirPago()"
                        [disabled]="procesando()">
                  @if (procesando()) {
                    <span class="spinner-border spinner-border-sm"></span> Procesando...
                  } @else {
                    <i class="bi bi-credit-card"></i> Finalizar Compra
                  }
                </button>
              }
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== MODAL DE PAGO (Efectivo / QR) ===== -->
    @if (mostrarModalPago()) {
      <div class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.6); z-index:1050;">
        <div class="modal-dialog modal-md modal-dialog-centered">
          <div class="modal-content shadow-lg" style="border-radius: 20px;">
            <div class="modal-header text-white"
                 style="background: linear-gradient(135deg, #1B5E20, #2E7D32); border-radius: 20px 20px 0 0;">
              <h5 class="modal-title fw-bold">
                <i class="bi bi-credit-card-2-front me-2"></i> Método de Pago
              </h5>
              <button type="button" class="btn-close btn-close-white" (click)="cerrarModalPago()"></button>
            </div>
            <div class="modal-body text-center py-4">

              <!-- Total -->
              <div class="mb-4 p-3 bg-success bg-opacity-10 rounded-3">
                <h4 class="mb-0">
                  Total a pagar: <span class="text-success fw-bold">S/. {{ total() }}</span>
                </h4>
              </div>

              @if (!tipoPagoSeleccionado()) {
                <div class="row g-3 justify-content-center">
                  <div class="col-5">
                    <button class="btn btn-success w-100 py-4" (click)="seleccionarPago('EFECTIVO')"
                            style="border-radius: 15px;">
                      <div class="d-flex flex-column align-items-center">
                        <i class="bi bi-cash-coin" style="font-size: 3rem;"></i>
                        <strong class="mt-2">Efectivo</strong>
                      </div>
                    </button>
                  </div>
                  <div class="col-5">
                    <button class="btn btn-primary w-100 py-4" (click)="seleccionarPago('QR')"
                            style="border-radius: 15px;">
                      <div class="d-flex flex-column align-items-center">
                        <i class="bi bi-qr-code" style="font-size: 3rem;"></i>
                        <strong class="mt-2">Pago con QR</strong>
                      </div>
                    </button>
                  </div>
                </div>
              }

              <!-- EFECTIVO -->
              @if (tipoPagoSeleccionado() === 'EFECTIVO') {
                <div class="mt-3">
                  <label class="form-label fw-bold">Monto recibido</label>
                  <input type="number" class="form-control form-control-lg text-end"
                         [(ngModel)]="montoRecibido" min="0" step="0.01"
                         placeholder="0.00">
                  @if (montoRecibido > 0) {
                    <div class="mt-2 p-2 bg-light rounded">
                      <div class="d-flex justify-content-between">
                        <span>Total:</span><span>S/. {{ total() }}</span>
                      </div>
                      <div class="d-flex justify-content-between fw-bold text-success">
                        <span>Vuelto:</span><span>S/. {{ vuelto() }}</span>
                      </div>
                    </div>
                  }
                  <button class="btn btn-success btn-lg mt-3 px-5 fw-bold" (click)="confirmarPago()"
                          [disabled]="procesandoPago || montoRecibido < total()"
                          style="border-radius: 50px;">
                    <i class="bi bi-check-circle me-2"></i> Confirmar pago
                  </button>
                  <button class="btn btn-outline-secondary mt-2 px-4" (click)="volverAPago()">
                    <i class="bi bi-arrow-left me-1"></i> Volver
                  </button>
                </div>
              }

              <!-- QR -->
              @if (tipoPagoSeleccionado() === 'QR') {
                <div class="mt-3">
                  <h5 class="mb-3">Selecciona el servicio</h5>
                  <div class="btn-group w-100 mb-3" role="group">
                    <input type="radio" class="btn-check" name="metodoQR" id="yape"
                           [(ngModel)]="metodoQR" value="YAPE">
                    <label class="btn fw-bold py-2" for="yape"
                           style="color:#7B1FA2; border:2px solid #7B1FA2;">Yape</label>

                    <input type="radio" class="btn-check" name="metodoQR" id="plin"
                           [(ngModel)]="metodoQR" value="PLIN">
                    <label class="btn fw-bold py-2" for="plin"
                           style="color:#197687; border:2px solid #198754;">Plin</label>

                    <input type="radio" class="btn-check" name="metodoQR" id="sip"
                           [(ngModel)]="metodoQR" value="SIP">
                    <label class="btn fw-bold py-2" for="sip"
                           style="color:#0dcaf0; border:2px solid #0dcaf0;">SIP</label>
                  </div>

                  <div class="p-3 bg-white d-inline-block rounded-3 shadow-sm mx-auto"
                       style="border: 3px solid #2E7D32;">
                    <img [src]="getQrImage()" [alt]="'QR ' + metodoQR"
                         class="img-fluid" style="width: 200px; border-radius: 15px;">
                  </div>

                  <div class="alert alert-info mt-3 py-2">
                    <i class="bi bi-info-circle me-2"></i>
                    Escanea el QR con <strong>{{ metodoQR }}</strong>
                  </div>

                  <button class="btn btn-success btn-lg mt-2 px-5 fw-bold" (click)="confirmarPago()"
                          [disabled]="procesandoPago"
                          style="border-radius: 50px;">
                    <i class="bi bi-check-circle me-2"></i> ✅ Ya pagué
                  </button>
                  <button class="btn btn-outline-secondary mt-2 px-4" (click)="volverAPago()">
                    <i class="bi bi-arrow-left me-1"></i> Volver
                  </button>
                </div>
              }

              @if (procesandoPago) {
                <div class="mt-3">
                  <div class="spinner-border text-success" role="status"></div>
                  <p class="mt-2 text-muted">Procesando pago...</p>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    }

    <!-- ===== MODAL DE ÉXITO ===== -->
    @if (mostrarExito()) {
      <div class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.6); z-index:1080;">
        <div class="modal-dialog modal-md modal-dialog-centered">
          <div class="modal-content shadow-lg">
            <div class="modal-header bg-success text-white">
              <h5 class="modal-title"><i class="bi bi-check-circle"></i> ¡Pedido enviado!</h5>
              <button type="button" class="btn-close btn-close-white" (click)="cerrarExito()"></button>
            </div>
            <div class="modal-body text-center py-4">
              <div class="display-1 text-success mb-2">✅</div>
              <h4>Pedido #{{ ventaCreada()?.id }} registrado</h4>
              <p class="text-muted">
                Tu pedido quedó en estado <strong>PENDIENTE</strong>.<br>
                Acércate a caja para que el cajero cobre y confirme tu pago.<br>
                Una vez confirmado, podrás ver y descargar tu boleta.
              </p>
              <div class="d-flex gap-2 justify-content-center mt-3">
                <a routerLink="/mis-pedidos" class="btn btn-success" (click)="cerrarExito()">
                  <i class="bi bi-box-seam"></i> Ver mis pedidos
                </a>
                <button class="btn btn-outline-secondary" (click)="cerrarExito()">
                  Seguir comprando
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .btn-check:checked + .btn { color: white !important; }
    .btn-check:checked + .btn[style*="#7B1FA2"] { background-color: #7B1FA2 !important; border-color: #7B1FA2 !important; }
    .btn-check:checked + .btn[style*="#198754"] { background-color: #198754 !important; border-color: #198754 !important; }
    .btn-check:checked + .btn[style*="#0dcaf0"] { background-color: #0dcaf0 !important; border-color: #0dcaf0 !important; }
  `]
})
export class TiendaComponent implements OnInit {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  productos = signal<Producto[]>([]);
  carrito = signal<{producto: Producto, cantidad: number}[]>([]);

  dniCliente = '';
  nombresCliente = '';
  apellidosCliente = '';
  esClienteVinculado = false;

  // ===== Modal de pago =====
  mostrarModalPago = signal(false);
  tipoPagoSeleccionado = signal<string | null>(null);
  metodoQR = 'YAPE';
  montoRecibido = 0;
  procesandoPago = false;

  // ===== Estado de compra =====
  procesando = signal(false);
  mostrarExito = signal(false);
  ventaCreada = signal<Venta | null>(null);

  qrImages: Record<string, string> = {
    YAPE: '/assets/images/qr-yape.jpg',
    PLIN: '/assets/images/qr-plin.jpg',
    SIP:  '/assets/images/qr-sip.jpg'
  };

  ngOnInit(): void {
    this.http.get<Producto[]>('/api/productos').subscribe(data => this.productos.set(data));

    // Si el usuario CLIENTE tiene perfil en su sesión, precargar al instante
    const u = this.auth.usuarioActual();
    if (u?.nombre || u?.apellidos || u?.dni) {
      this.dniCliente = u.dni ?? '';
      this.nombresCliente = u.nombre ?? '';
      this.apellidosCliente = u.apellidos ?? '';
      this.esClienteVinculado = true;
    }

    // Respaldo: si solo conocemos el id, consultar el perfil completo
    const clienteId = this.auth.clienteId();
    if (clienteId && !u?.dni) {
      this.http.get<any>(`/api/clientes/${clienteId}`).subscribe({
        next: (c) => {
          this.dniCliente = c?.dni ?? this.dniCliente;
          this.nombresCliente = c?.nombres ?? this.nombresCliente;
          this.apellidosCliente = c?.apellidos ?? this.apellidosCliente;
          this.esClienteVinculado = true;
        }
      });
    }
  }

  agregarCarrito(p: Producto) {
    const item = this.carrito().find(i => i.producto.idProducto === p.idProducto);
    if (item) {
      item.cantidad++;
      this.carrito.update(c => [...c]);
    } else {
      this.carrito.update(c => [...c, { producto: p, cantidad: 1 }]);
    }
  }

  quitarCarrito(p: Producto) {
    this.carrito.update(c => c.filter(i => i.producto.idProducto !== p.idProducto));
  }

  recalcular(): void {
    // Trigger OnPush para recalcular total
    this.carrito.update(c => [...c]);
  }

  total(): number {
    return this.carrito().reduce((sum, item) =>
      sum + (item.producto.precio * (item.cantidad || 0)), 0);
  }

  vuelto(): number {
    return Math.max(0, Math.round((this.montoRecibido - this.total()) * 100) / 100);
  }

  getQrImage(): string {
    return this.qrImages[this.metodoQR] || this.qrImages['YAPE'];
  }

  // ===== Apertura y cierre del modal =====
  abrirPago(): void {
    if (!this.dniCliente || !this.nombresCliente || this.carrito().length === 0) {
      alert('Completa tus datos y agrega al menos un producto al carrito.');
      return;
    }
    this.tipoPagoSeleccionado.set(null);
    this.montoRecibido = 0;
    this.procesandoPago = false;
    this.mostrarModalPago.set(true);
  }

  cerrarModalPago(): void {
    this.mostrarModalPago.set(false);
    this.tipoPagoSeleccionado.set(null);
    this.procesandoPago = false;
  }

  volverAPago(): void {
    this.tipoPagoSeleccionado.set(null);
    this.procesandoPago = false;
  }

  seleccionarPago(tipo: string): void {
    this.tipoPagoSeleccionado.set(tipo);
    this.montoRecibido = 0;
  }

  // ===== Confirmación de pago =====
  // 🔥 El cliente simula el pago. La venta se crea en estado PENDIENTE.
  // El cajero debe aprobarla desde /ventas para que pase a FINALIZADA.
  confirmarPago(): void {
    if (this.tipoPagoSeleccionado() === 'EFECTIVO' && this.montoRecibido < this.total()) {
      alert('El monto recibido es menor al total.');
      return;
    }
    this.procesandoPago = true;

    const payload = {
      username: this.auth.usuarioActual()?.username ?? null,
      dni: this.dniCliente,
      nombres: this.nombresCliente,
      apellidos: this.apellidosCliente,
      productos: this.carrito().map(i => ({
        productoId: i.producto.idProducto,
        cantidad: i.cantidad
      }))
    };

    // 🔥 Simular procesamiento de pago (1.5s)
    setTimeout(() => {
      this.http.post<Venta>('/api/ventas/web', payload).subscribe({
        next: (venta) => {
          this.procesandoPago = false;
          this.procesando.set(false);
          this.mostrarModalPago.set(false);
          this.ventaCreada.set(venta);
          this.mostrarExito.set(true);
          this.carrito.set([]);
          // Mantener los datos del cliente (es el mismo usuario)
        },
        error: (err) => {
          this.procesandoPago = false;
          const msg = err.error?.message || err.error || err.message || 'Error al procesar el pago';
          alert(typeof msg === 'string' ? msg : 'Error al procesar el pago');
        }
      });
    }, 1500);
  }

  cerrarExito(): void {
    this.mostrarExito.set(false);
    this.ventaCreada.set(null);
  }
}
