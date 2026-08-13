import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CategoriaService } from '../../core/services/categoria.service';
import { Categoria } from '../../core/models/models';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container mt-5">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Categorías</h2>
          <p class="text-muted">Gestión de categorías de productos.</p>
        </div>
        <button class="btn btn-success" (click)="abrirFormulario()">
          <i class="bi bi-plus-circle"></i> Nueva Categoría
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
        <div class="text-center py-5">
          <div class="spinner-border text-success" role="status"></div>
        </div>
      } @else {
        <div class="card shadow">
          <div class="card-body">
            <table class="table table-hover table-bordered align-middle">
              <thead class="table-dark">
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th style="width:140px">Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (c of categorias(); track c.idCategoria) {
                  <tr>
                    <td>{{ c.idCategoria }}</td>
                    <td>{{ c.nombre }}</td>
                    <td>
                      <button class="btn btn-warning btn-sm me-1" (click)="editar(c)" title="Editar">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn btn-danger btn-sm" (click)="eliminar(c)" title="Eliminar">
                        <i class="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="3" class="text-center text-muted py-4">
                      No hay categorías. Crea una para poder registrar productos.
                    </td>
                  </tr>
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
                <h5 class="modal-title">
                  {{ categoriaEditando.idCategoria ? 'Editar Categoría' : 'Nueva Categoría' }}
                </h5>
                <button type="button" class="btn-close btn-close-white" (click)="cerrarFormulario()"></button>
              </div>
              <div class="modal-body">
                <form (ngSubmit)="guardar()">
                  <div class="mb-3">
                    <label class="form-label fw-bold">Nombre</label>
                    <input type="text"
                           class="form-control"
                           name="nombre"
                           [(ngModel)]="categoriaEditando.nombre"
                           maxlength="40"
                           required
                           placeholder="Ej: Abarrotes, Lácteos, Bebidas">
                  </div>
                  <div class="text-end">
                    <button type="button" class="btn btn-secondary me-2" (click)="cerrarFormulario()">
                      Cancelar
                    </button>
                    <button type="submit" class="btn btn-success" [disabled]="guardando()">
                      @if (guardando()) {
                        Guardando...
                      } @else {
                        Guardar
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
export class CategoriasComponent implements OnInit {
  private categoriaService = inject(CategoriaService);

  categorias = signal<Categoria[]>([]);
  cargando = signal(true);
  guardando = signal(false);
  mostrarFormulario = signal(false);
  mensaje = signal('');
  error = signal('');

  categoriaEditando: Categoria = { nombre: '' };

  ngOnInit(): void {
    this.cargar();
  }

  private cargar(): void {
    this.cargando.set(true);
    this.categoriaService.listar().subscribe({
      next: (data) => {
        this.categorias.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set('Error al cargar categorías.');
        this.cargando.set(false);
      }
    });
  }

  abrirFormulario(): void {
    this.categoriaEditando = { nombre: '' };
    this.mostrarFormulario.set(true);
  }

  editar(c: Categoria): void {
    this.categoriaEditando = { ...c };
    this.mostrarFormulario.set(true);
  }

  cerrarFormulario(): void {
    this.mostrarFormulario.set(false);
  }

  guardar(): void {
    if (!this.categoriaEditando.nombre?.trim()) {
      this.error.set('El nombre es obligatorio.');
      return;
    }

    this.guardando.set(true);
    this.error.set('');

    this.categoriaService.guardar(this.categoriaEditando).subscribe({
      next: () => {
        this.guardando.set(false);
        this.cerrarFormulario();
        this.mensaje.set(
          this.categoriaEditando.idCategoria
            ? 'Categoría actualizada correctamente.'
            : 'Categoría creada correctamente.'
        );
        this.cargar();
      },
      error: (err) => {
        this.guardando.set(false);
        // Caso: backend respondió 200 pero el body no era JSON válido
        if (err.status === 200) {
          this.cerrarFormulario();
          this.mensaje.set('Categoría guardada correctamente.');
          this.cargar();
          return;
        }
        console.error(err);
        this.error.set('No se pudo guardar. ¿El nombre ya existe?');
      }
    });
  }

  eliminar(c: Categoria): void {
    if (!confirm(`¿Eliminar la categoría "${c.nombre}"?`)) return;

    this.categoriaService.eliminar(c.idCategoria!).subscribe({
      next: () => {
        this.mensaje.set('Categoría eliminada.');
        this.cargar();
      },
      error: (err) => {
        console.error(err);
        this.error.set('No se pudo eliminar. Puede estar en uso por productos.');
      }
    });
  }
}