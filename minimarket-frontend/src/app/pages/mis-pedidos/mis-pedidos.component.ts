import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { Venta, DetalleVenta } from '../../core/models/models';

@Component({
  selector: 'app-mis-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container mt-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="mb-0">📦 Mis Pedidos</h2>
        <a routerLink="/tienda" class="btn btn-outline-success">🛒 Volver a la tienda</a>
      </div>

      @if (cargando()) {
        <div class="text-center py-4">
          <span class="spinner-border text-success"></span>
        </div>
      } @else if (error()) {
        <div class="alert alert-danger">{{ error() }}</div>
      } @else if (sinCliente()) {
        <div class="alert alert-info">
          <i class="bi bi-info-circle"></i>
          Aún no tienes un perfil de cliente vinculado.
          Realiza tu primera compra en la tienda para ver tus pedidos aquí.
        </div>
      } @else if (pedidos().length > 0) {
        <div class="row">
          @for (p of pedidos(); track p.id) {
            <div class="col-md-12 mb-3">
              <div class="card shadow-sm">
                <div class="card-header d-flex justify-content-between align-items-center"
                     [class.bg-success]="p.estado === 'FINALIZADA' || p.estado === 'COMPLETADO'"
                     [class.text-white]="p.estado === 'FINALIZADA' || p.estado === 'COMPLETADO'"
                     [class.bg-warning]="p.estado === 'PENDIENTE'"
                     [class.bg-danger]="p.estado === 'CANCELADA'"
                     [class.text-white]="p.estado === 'CANCELADA'">
                  <div>
                    <strong>Pedido #{{ p.id }}</strong>
                    <small class="ms-2">
                      {{ p.fechaRegistro | date:'medium' }}
                    </small>
                  </div>
                  <span class="badge bg-light text-dark">
                    {{ estadoLabel(p.estado) }}
                  </span>
                </div>
                <div class="card-body">
                  <!-- Productos comprados -->
                  <h6 class="fw-bold mb-2">
                    <i class="bi bi-bag"></i> Productos
                  </h6>
                  @if (p.detalles && p.detalles.length > 0) {
                    <ul class="list-group list-group-flush mb-3">
                      @for (d of p.detalles; track d.id) {
                        <li class="list-group-item d-flex justify-content-between align-items-center px-0 py-2">
                          <div>
                            <strong>{{ d.producto?.nombre || 'Producto #' + d.productoId }}</strong>
                            <small class="text-muted d-block">
                              {{ d.cantidad }} x S/. {{ d.precio }}
                            </small>
                          </div>
                          <span class="fw-bold">S/. {{ d.subtotal }}</span>
                        </li>
                      }
                    </ul>
                  } @else {
                    <p class="text-muted small mb-3">
                      <i class="bi bi-info-circle"></i>
                      No hay detalles disponibles para este pedido.
                    </p>
                  }

                  <div class="d-flex justify-content-between align-items-center">
                    <div>
                      <small class="text-muted d-block">Total</small>
                      <h4 class="text-success mb-0">S/. {{ p.total }}</h4>
                    </div>
                    <div>
                      @if (p.metodoPago) {
                        <span class="badge bg-info me-2">
                          <i class="bi bi-credit-card"></i> {{ p.metodoPago }}
                        </span>
                      }
                      @if (p.estado === 'FINALIZADA' || p.estado === 'COMPLETADO') {
                        <button class="btn btn-info text-white btn-sm" (click)="verBoleta(p)">
                          <i class="bi bi-printer"></i> Ver boleta
                        </button>
                      } @else if (p.estado === 'PENDIENTE') {
                        <span class="text-warning small">
                          <i class="bi bi-clock"></i> Esperando confirmación de caja
                        </span>
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="alert alert-info">
          <i class="bi bi-info-circle"></i>
          No tienes pedidos registrados todavía.
          <a routerLink="/tienda" class="alert-link">Hacer mi primera compra</a>
        </div>
      }
    </div>
  `
})
export class MisPedidosComponent implements OnInit {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  cargando = signal(false);
  sinCliente = signal(false);
  error = signal('');
  pedidos = signal<Venta[]>([]);

  ngOnInit(): void {
    const clienteId = this.auth.clienteId();
    if (!clienteId) {
      this.sinCliente.set(true);
      return;
    }
    this.cargar(clienteId);
  }

  private cargar(clienteId: number) {
    this.cargando.set(true);
    this.error.set('');
    this.http.get<Venta[]>(`/api/clientes/${clienteId}/pedidos`).subscribe({
      next: (data) => this.pedidos.set(data ?? []),
      error: () => {
        this.pedidos.set([]);
        this.error.set('Error al consultar tus pedidos.');
      },
      complete: () => this.cargando.set(false)
    });
  }

  estadoLabel(estado?: string): string {
    if (!estado) return '—';
    switch (estado) {
      case 'FINALIZADA': return '✅ Finalizada';
      case 'COMPLETADO': return '✅ Completado';
      case 'PENDIENTE':  return '⏳ Pendiente de pago';
      case 'CANCELADA':  return '❌ Cancelada';
      default: return estado;
    }
  }

  verBoleta(v: Venta): void {
    const fechaStr = v.fechaRegistro ? new Date(v.fechaRegistro).toLocaleString('es-PE') : '';
    const estadoStr = v.estado || '';
    const clienteStr = v.cliente ? `${v.cliente.nombres} ${v.cliente.apellidos}` : 'Cliente';
    const dniStr = v.cliente?.dni || '—';
    const metodoStr = v.metodoPago || '—';
    const montoRecibido = v.montoRecibido ?? 0;
    const total = v.total ?? 0;
    const vuelto = Math.round((montoRecibido - total) * 100) / 100;

    // Construir filas de productos
    let productosHtml = '';
    if (v.detalles && v.detalles.length > 0) {
      productosHtml = v.detalles.map((d: DetalleVenta) => `
        <tr>
          <td>${d.producto?.nombre || 'Producto #' + (d as any).productoId}</td>
          <td style="text-align:center">${d.cantidad}</td>
          <td style="text-align:right">S/. ${d.precio}</td>
          <td style="text-align:right">S/. ${d.subtotal}</td>
        </tr>
      `).join('');
    }

    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Boleta #${v.id}</title>
        <style>
          * { font-family: 'Courier New', monospace; box-sizing: border-box; }
          body { width: 380px; margin: 0 auto; padding: 12px; color: #000; }
          h1 { font-size: 16px; text-align: center; margin: 0 0 4px 0; }
          .subtitle { text-align: center; font-size: 11px; margin-bottom: 12px; color: #555; }
          hr { border: none; border-top: 1px dashed #000; margin: 8px 0; }
          .row { display: flex; justify-content: space-between; font-size: 12px; margin: 2px 0; }
          .total { font-weight: bold; font-size: 14px; }
          .footer { text-align: center; font-size: 10px; margin-top: 12px; color: #555; }
          .header-logo { text-align: center; margin-bottom: 8px; font-size: 24px; }
          .estado-badge { display: inline-block; padding: 2px 8px; border: 1px solid #000; border-radius: 3px; font-size: 10px; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; margin: 8px 0; }
          th, td { padding: 4px 6px; border-bottom: 1px dashed #ccc; }
          th { background: #f0f0f0; text-align: left; }
          @media print { body { width: auto; padding: 0; } }
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
        <div class="row"><span><strong>Método de pago:</strong></span><span>${metodoStr}</span></div>
        ${
          metodoStr !== '—' && metodoStr !== 'EFECTIVO'
            ? ''
            : `<div class="row"><span><strong>Monto recibido:</strong></span><span>S/. ${montoRecibido}</span></div>
               <div class="row"><span><strong>Vuelto:</strong></span><span>S/. ${vuelto}</span></div>`
        }
        <hr>
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th style="text-align:center">Cant.</th>
              <th style="text-align:right">Precio</th>
              <th style="text-align:right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${productosHtml || '<tr><td colspan="4" style="text-align:center">Sin productos</td></tr>'}
          </tbody>
        </table>
        <hr>
        <div class="row"><span><strong>TOTAL:</strong></span><span class="total">S/. ${total}</span></div>
        <hr>
        <div class="footer">
          ¡Gracias por su compra!<br>
          Documento generado automáticamente - MiniMarket<br>
          ${new Date().toLocaleString('es-PE')}
        </div>
        <script>
          setTimeout(function(){ window.print(); }, 200);
        </scr` + `ipt>
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank', 'width=440,height=720');
    if (!win) {
      this.error.set('El navegador bloqueó la apertura de la boleta. Permití pop-ups.');
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      return;
    }
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }
}
