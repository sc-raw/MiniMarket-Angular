import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { Producto } from '../../core/models/models';

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
                    <button class="btn btn-sm btn-primary w-100" (click)="agregarCarrito(p)">
                      <i class="bi bi-cart-plus"></i> Agregar
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
              <h5 class="mb-0">Carrito</h5>
            </div>
            <div class="card-body">
              @if (carrito().length === 0) {
                <p class="text-muted text-center">Tu carrito está vacío.</p>
              } @else {
                @for (item of carrito(); track item.producto.idProducto) {
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <div>
                      <strong>{{ item.producto.nombre }}</strong><br>
                      <small>S/. {{ item.producto.precio }} x {{ item.cantidad }}</small>
                    </div>
                    <button class="btn btn-danger btn-sm" (click)="quitarCarrito(item.producto)">X</button>
                  </div>
                  <hr>
                }
                <h4 class="text-end">Total: S/. {{ total() }}</h4>
                
                <hr>
                <h6>Datos de Envío</h6>
                <input type="text" class="form-control mb-2" placeholder="DNI" [(ngModel)]="dniCliente">
                <input type="text" class="form-control mb-2" placeholder="Nombres" [(ngModel)]="nombresCliente">
                <input type="text" class="form-control mb-2" placeholder="Apellidos" [(ngModel)]="apellidosCliente">
                
                <button class="btn btn-success w-100 mt-2" (click)="comprar()">Finalizar Compra</button>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TiendaComponent implements OnInit {
  private http = inject(HttpClient);

  productos = signal<Producto[]>([]);
  carrito = signal<{producto: Producto, cantidad: number}[]>([]);
  
  dniCliente = '';
  nombresCliente = '';
  apellidosCliente = '';

  ngOnInit(): void {
    this.http.get<Producto[]>('/api/productos').subscribe(data => this.productos.set(data));
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

  total(): number {
    return this.carrito().reduce((sum, item) => sum + (item.producto.precio * item.cantidad), 0);
  }

  comprar() {
    if (!this.dniCliente || !this.nombresCliente) {
      alert('Por favor ingresa tu DNI y nombres.');
      return;
    }

    const payload = {
      dni: this.dniCliente,
      nombres: this.nombresCliente,
      apellidos: this.apellidosCliente,
      productos: this.carrito().map(i => ({ productoId: i.producto.idProducto, cantidad: i.cantidad }))
    };

    this.http.post('/api/ventas/web', payload).subscribe({
      next: () => {
        alert('¡Compra realizada con éxito! Pedido en proceso.');
        this.carrito.set([]);
        this.dniCliente = '';
        this.nombresCliente = '';
        this.apellidosCliente = '';
      },
      error: (err) => alert('Error al procesar la compra: ' + err.message)
    });
  }
}