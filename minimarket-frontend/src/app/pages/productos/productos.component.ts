import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ProductoService } from '../../core/services/producto.service';
import { CategoriaService } from '../../core/services/categoria.service';
import { AuthService } from '../../core/auth/auth.service';
import { Producto, Categoria } from '../../core/models/models';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [FormsModule, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container mt-5">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Productos</h2>
          <p class="text-muted">
            @if (auth.puedeGestionarProductos()) {
              Gestión completa de productos.
            } @else if (auth.puedeActualizarStock()) {
              Actualización de stock de productos.
            } @else {
              Lista de productos (solo lectura).
            }
          </p>
        </div>
        @if (auth.puedeGestionarProductos()) {
          <button class="btn btn-success" (click)="abrirFormulario()">
            <i class="bi bi-plus-circle"></i> Nuevo Producto
          </button>
        }
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
            <!-- Buscador + filtros -->
            <div class="row mb-3 g-2 align-items-center">
              <div class="col-md-6">
                <input type="text" class="form-control"
                       placeholder="Buscar por nombre o código..."
                       [ngModel]="textoBusqueda()"
                       (ngModelChange)="textoBusqueda.set($event); aplicarFiltros()"
                       name="busqueda">
              </div>
              <div class="col-md-6 text-md-end">
                <div class="btn-group">
                  <button type="button" class="btn"
                          [class.btn-success]="filtroEstado() === 'TODOS'"
                          [class.btn-outline-success]="filtroEstado() !== 'TODOS'"
                          (click)="setFiltro('TODOS')">Todos</button>
                  <button type="button" class="btn"
                          [class.btn-success]="filtroEstado() === 'ACTIVOS'"
                          [class.btn-outline-success]="filtroEstado() !== 'ACTIVOS'"
                          (click)="setFiltro('ACTIVOS')">Activos</button>
                  <button type="button" class="btn"
                          [class.btn-success]="filtroEstado() === 'INACTIVOS'"
                          [class.btn-outline-success]="filtroEstado() !== 'INACTIVOS'"
                          (click)="setFiltro('INACTIVOS')">Inactivos</button>
                </div>
              </div>
            </div>

            <table class="table table-hover table-bordered align-middle">
              <thead class="table-dark">
                <tr>
                  <th>ID</th>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Vencimiento</th>
                  <th>Estado</th>
                  @if (auth.puedeGestionarProductos() || auth.puedeActualizarStock()) {
                    <th>Acciones</th>
                  }
                </tr>
              </thead>
              <tbody>
                @for (p of productosFiltrados(); track p.idProducto) {
                  <tr>
                    <td>{{ p.idProducto }}</td>
                    <td class="fw-bold">{{ p.codigo }}</td>
                    <td>{{ p.nombre }}</td>
                    <td><span class="badge bg-info">{{ p.categoria?.nombre }}</span></td>
                    <td class="text-end">S/. {{ p.precio }}</td>
                    <td class="text-center">
                      <span class="badge"
                            [class.bg-danger]="(p.stock ?? 0) < 5"
                            [class.bg-success]="(p.stock ?? 0) >= 5">
                        {{ p.stock }}
                      </span>
                    </td>
                    <td class="text-center">
                      @if (p.fechaVencimiento) {
                        <span class="badge"
                              [class.bg-danger]="estaVencido(p.fechaVencimiento)"
                              [class.bg-warning]="!estaVencido(p.fechaVencimiento) && estaProximoAVencer(p.fechaVencimiento)"
                              [class.bg-secondary]="!estaVencido(p.fechaVencimiento) && !estaProximoAVencer(p.fechaVencimiento)">
                          {{ p.fechaVencimiento | date:'dd/MM/yyyy' }}
                        </span>
                      } @else {
                        <span class="text-muted">—</span>
                      }
                    </td>
                    <td>
                      @if (p.estado) {
                        <span class="badge bg-success">Activo</span>
                      } @else {
                        <span class="badge bg-danger">Inactivo</span>
                      }
                    </td>
                    @if (auth.puedeGestionarProductos() || auth.puedeActualizarStock()) {
                      <td>
                        @if (auth.puedeGestionarProductos()) {
                          <button class="btn btn-warning btn-sm me-1" (click)="editar(p)" title="Editar">
                            <i class="bi bi-pencil"></i>
                          </button>
                          <button class="btn btn-danger btn-sm" (click)="eliminar(p)" title="Eliminar">
                            <i class="bi bi-trash"></i>
                          </button>
                        } @else if (auth.puedeActualizarStock()) {
                          <button class="btn btn-info btn-sm" (click)="abrirFormularioStock(p)" title="Actualizar Stock">
                            <i class="bi bi-box-seam"></i> Stock
                          </button>
                        }
                      </td>
                    }
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="9" class="text-center text-muted py-4">
                      No hay productos con esos filtros.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      @if (auth.puedeGestionarProductos() && mostrarFormulario()) {
        <div class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.5)">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header text-white" style="background:#2E7D32;">
                <h5 class="modal-title">
                  {{ productoEditando.idProducto ? 'Editar Producto' : 'Nuevo Producto' }}
                </h5>
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
                      <label class="form-label fw-bold">
                        Vencimiento <small class="text-muted">(opcional)</small>
                      </label>
                      <input type="date" class="form-control" name="fechaVencimiento"
                             [ngModel]="productoEditando.fechaVencimiento"
                             (ngModelChange)="productoEditando.fechaVencimiento = $event || null">
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

      @if (auth.puedeActualizarStock() && !auth.puedeGestionarProductos() && mostrarFormularioStock()) {
        <div class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.5)">
          <div class="modal-dialog modal-sm">
            <div class="modal-content">
              <div class="modal-header text-white" style="background:#0288D1;">
                <h5 class="modal-title">
                  <i class="bi bi-box-seam me-2"></i>Actualizar Stock
                </h5>
                <button type="button" class="btn-close btn-close-white" (click)="cerrarFormularioStock()"></button>
              </div>
              <div class="modal-body">
                <div class="mb-3">
                  <label class="form-label fw-bold">Producto</label>
                  <p class="form-control-plaintext fw-bold">{{ productoStockEditando()?.nombre }}</p>
                </div>
                <div class="mb-3">
                  <label class="form-label fw-bold">Stock Actual</label>
                  <p class="form-control-plaintext">
                    <span class="badge bg-secondary fs-6">{{ productoStockEditando()?.stock }}</span>
                  </p>
                </div>
                <div class="mb-3">
                  <label class="form-label fw-bold">Nuevo Stock</label>
                  <input type="number" min="0" class="form-control" name="nuevoStock"
                         [(ngModel)]="nuevoStock" required>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" (click)="cerrarFormularioStock()">Cancelar</button>
                <button type="button" class="btn btn-info" (click)="guardarStock()" [disabled]="guardando()">
                  @if (guardando()) {
                    <span class="spinner-border spinner-border-sm"></span> Guardando...
                  } @else {
                    <i class="bi bi-check-circle"></i> Actualizar
                  }
                </button>
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
  protected auth = inject(AuthService);

  productos = signal<Producto[]>([]);
  productosFiltrados = signal<Producto[]>([]);
  categorias = signal<Categoria[]>([]);
  cargando = signal(true);
  guardando = signal(false);
  mostrarFormulario = signal(false);
  mostrarFormularioStock = signal(false);
  mensaje = signal('');
  error = signal('');

  filtroEstado = signal<'TODOS' | 'ACTIVOS' | 'INACTIVOS'>('TODOS');
  textoBusqueda = signal('');

  productoEditando: Producto = this.productoVacio();
  productoStockEditando = signal<Producto | null>(null);
  nuevoStock = 0;

  ngOnInit(): void {
    this.cargar();
    this.categoriaService.listar().subscribe(d => this.categorias.set(d));
  }

  private cargar(): void {
    this.cargando.set(true);
    this.productoService.listarTodos().subscribe({
      next: (data) => {
        this.productos.set(data);
        this.aplicarFiltros();
        this.cargando.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set('Error al cargar productos.');
        this.cargando.set(false);
      }
    });
  }

  aplicarFiltros(): void {
    const texto = this.textoBusqueda().toLowerCase().trim();
    const estado = this.filtroEstado();
    let lista = this.productos();

    if (estado === 'ACTIVOS') lista = lista.filter(p => p.estado === true);
    else if (estado === 'INACTIVOS') lista = lista.filter(p => p.estado === false);
    if (texto) {
      lista = lista.filter(p =>
        (p.nombre ?? '').toLowerCase().includes(texto) ||
        (p.codigo ?? '').toLowerCase().includes(texto)
      );
    }
    this.productosFiltrados.set(lista);
  }

  setFiltro(estado: 'TODOS' | 'ACTIVOS' | 'INACTIVOS'): void {
    this.filtroEstado.set(estado);
    this.aplicarFiltros();
  }

  private productoVacio(): Producto {
    return {
      codigo: '', nombre: '', descripcion: '', precio: 0,
      stock: 0, estado: true, fechaVencimiento: null, categoria: null
    };
  }

  // ====== CRUD (solo admin) ======
  abrirFormulario(): void {
    this.productoEditando = this.productoVacio();
    this.mostrarFormulario.set(true);
  }

  editar(p: Producto): void {
    this.productoEditando = { ...p };
    if (p.categoria?.idCategoria != null) {
      const encontrada = this.categorias().find(c => c.idCategoria === p.categoria!.idCategoria);
      this.productoEditando.categoria = encontrada ?? p.categoria;
    }
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

  // ====== ACTUALIZAR STOCK (admin y reponedor) ======
  abrirFormularioStock(p: Producto): void {
    this.productoStockEditando.set({ ...p });
    this.nuevoStock = p.stock ?? 0;
    this.mostrarFormularioStock.set(true);
  }

  cerrarFormularioStock(): void {
    this.mostrarFormularioStock.set(false);
  }

  guardarStock(): void {
    const producto = this.productoStockEditando();
    if (!producto || !producto.idProducto) return;
    if (this.nuevoStock == null || this.nuevoStock < 0) {
      this.error.set('El stock debe ser mayor o igual a 0.');
      return;
    }
    this.guardando.set(true);
    this.error.set('');
    this.productoService.actualizarStock(producto.idProducto, this.nuevoStock).subscribe({
      next: () => {
        this.guardando.set(false);
        this.cerrarFormularioStock();
        this.mensaje.set(`Stock actualizado: ${producto.nombre} → ${this.nuevoStock} unidades.`);
        this.cargar();
      },
      error: (err) => {
        this.guardando.set(false);
        this.error.set(typeof err?.error === 'string' ? err.error : 'Error al actualizar stock.');
        console.error(err);
      }
    });
  }

  // ====== VENCIMIENTO ======
  estaVencido(fecha: string | null | undefined): boolean {
    if (!fecha) return false;
    return new Date(fecha) < new Date(new Date().toISOString().split('T')[0]);
  }

  estaProximoAVencer(fecha: string | null | undefined): boolean {
    if (!fecha) return false;
    const hoy = new Date();
    const limite = new Date();
    limite.setDate(hoy.getDate() + 7);
    const f = new Date(fecha);
    return f >= hoy && f <= limite;
  }
}
