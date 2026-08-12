import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../core/services/producto.service';
import { CategoriaService } from '../../core/services/categoria.service';
import { Producto, Categoria } from '../../core/models/models';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container mt-5">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Productos</h2>
          <p class="text-muted">Gestión de productos registrados.</p>
        </div>
        <button class="btn btn-success" (click)="abrirFormulario()">
          <i class="bi bi-plus-circle"></i> Nuevo Producto
        </button>
      </div>

      @if (error()) {
        <div class="alert alert-danger alert-dismissible fade show">
          {{ error() }}
          <button type="button" class="btn-close" (click)="error.set('')"></button>
        </div>
      }
      @if (mensaje()) {
        <div class="alert alert-success alert-dismissible fade show">
          {{ mensaje() }}
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
                <tr>
                  <th>ID</th><th>Código</th><th>Nombre</th><th>Categoría</th>
                  <th>Precio</th><th>Stock</th><th>Estado</th><th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (p of productos(); track p.idProducto) {
                  <tr>
                    <td>{{ p.idProducto }}</td>
                    <td class="fw-bold">{{ p.codigo }}</td>
                    <td>{{ p.nombre }}</td>
                    <td><span class="badge bg-info">{{ p.categoria?.nombre }}</span></td>
                    <td class="text-end">S/. {{ p.precio }}</td>
                    <td class="text-center">
                      <span class="badge" [class.bg-danger]="(p.stock ?? 0) < 5" [class.bg-success]="(p.stock ?? 0) >= 5">
                        {{ p.stock }}
                      </span>
                    </td>
                    <td>
                      @if (p.estado) { <span class="badge bg-success">Activo</span> }
                      @else { <span class="badge bg-danger">Inactivo</span> }
                    </td>
                    <td>
                      <button class="btn btn-warning btn-sm me-1" (click)="editar(p)"><i class="bi bi-pencil"></i></button>
                      <button class="btn btn-danger btn-sm" (click)="eliminar(p)"><i class="bi bi-trash"></i></button>
                    </td>
                  </tr>
                } @empty {
                  <tr><td colspan="8" class="text-center text-muted py-4">No hay productos.</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      @if (mostrarFormulario()) {
        <div class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.5)">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header text-white" style="background:#2E7D32;">
                <h5 class="modal-title">{{ productoEditando.idProducto ? 'Editar Producto' : 'Nuevo Producto' }}</h5>
                <button type="button" class="btn-close btn-close-white" (click)="cerrarFormulario()"></button>
              </div>
              <div class="modal-body">
                <form (ngSubmit)="guardar()">
                  <div class="mb-3">
                    <label class="form-label fw-bold">Código</label>
                    <input type="text" class="form-control" name="codigo"
                           [(ngModel)]="productoEditando.codigo" required>
                  </div>
                  <div class="mb-3">
                    <label class="form-label fw-bold">Nombre</label>
                    <input type="text" class="form-control" name="nombre"
                           [(ngModel)]="productoEditando.nombre" required>
                  </div>
                  <div class="mb-3">
                    <label class="form-label fw-bold">Descripción</label>
                    <input type="text" class="form-control" name="descripcion"
                           [(ngModel)]="productoEditando.descripcion">
                  </div>
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label class="form-label fw-bold">Precio (S/.)</label>
                      <input type="number" step="0.01" min="0" class="form-control" name="precio"
                             [(ngModel)]="productoEditando.precio" required>
                    </div>
                    <div class="col-md-6 mb-3">
                      <label class="form-label fw-bold">Stock</label>
                      <input type="number" min="0" class="form-control" name="stock"
                             [(ngModel)]="productoEditando.stock" required>
                    </div>
                    <div class="col-md-6 mb-3">
                      <label class="form-label fw-bold">Categoría</label>
                      <select class="form-select" name="categoria"
                              [(ngModel)]="productoEditando.categoria" required>
                        <option [ngValue]="null">Seleccione...</option>
                        @for (c of categorias(); track c.idCategoria) {
                          <option [ngValue]="c">{{ c.nombre }}</option>
                        }
                      </select>
                    </div>
                    <div class="col-md-6 mb-3">
                      <label class="form-label fw-bold">Estado</label>
                      <select class="form-select" name="estado" [(ngModel)]="productoEditando.estado">
                        <option [ngValue]="true">Activo</option>
                        <option [ngValue]="false">Inactivo</option>
                      </select>
                    </div>
                  </div>
                  <div class="text-end">
                    <button type="button" class="btn btn-secondary me-2" (click)="cerrarFormulario()">Cancelar</button>
                    <button type="submit" class="btn btn-success" [disabled]="guardando()">
                      @if (guardando()) {
                        <span class="spinner-border spinner-border-sm"></span> Guardando...
                      } @else {
                        <i class="bi bi-check-circle"></i> Guardar
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
export class ProductosComponent implements OnInit {
  private productoService = inject(ProductoService);
  private categoriaService = inject(CategoriaService);

  productos = signal<Producto[]>([]);
  categorias = signal<Categoria[]>([]);
  cargando = signal(true);
  guardando = signal(false);
  mostrarFormulario = signal(false);
  mensaje = signal('');
  error = signal('');

  productoEditando: Producto = this.productoVacio();

  ngOnInit(): void {
    this.cargar();
    this.categoriaService.listar().subscribe(d => this.categorias.set(d));
  }

  private cargar(): void {
    this.cargando.set(true);
    this.productoService.listar().subscribe({
      next: (data) => { this.productos.set(data); this.cargando.set(false); },
      error: (err) => { console.error(err); this.cargando.set(false); }
    });
  }

  private productoVacio(): Producto {
    return {
      codigo: '', nombre: '', descripcion: '', precio: 0,
      stock: 0, estado: true, categoria: null
    };
  }

  abrirFormulario(): void {
    this.productoEditando = this.productoVacio();
    this.mostrarFormulario.set(true);
  }

  editar(p: Producto): void {
    this.productoEditando = { ...p };
    this.mostrarFormulario.set(true);
  }

  cerrarFormulario(): void {
    this.mostrarFormulario.set(false);
  }

  guardar(): void {
    this.guardando.set(true);
    this.error.set('');
    this.productoService.guardar(this.productoEditando).subscribe({
      next: () => {
        this.guardando.set(false);
        this.cerrarFormulario();
        this.mensaje.set('Producto guardado correctamente.');
        this.cargar();
      },
      error: (err) => {
        this.guardando.set(false);
        this.error.set('Error al guardar el producto.');
        console.error(err);
      }
    });
  }

  eliminar(p: Producto): void {
    if (!confirm(`¿Eliminar el producto ${p.nombre}?`)) return;
    this.productoService.eliminar(p.idProducto!).subscribe({
      next: () => {
        this.mensaje.set('Producto eliminado correctamente.');
        this.cargar();
      },
      error: (err) => {
        this.error.set('Error al eliminar el producto.');
        console.error(err);
      }
    });
  }
}
