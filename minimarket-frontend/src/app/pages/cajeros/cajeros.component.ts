import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CajeroService } from '../../core/services/cajero.service';
import { Cajero } from '../../core/models/models';

@Component({
  selector: 'app-cajeros',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container mt-5">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Cajeros</h2>
          <p class="text-muted">Gestión de cajeros del MiniMarket.</p>
        </div>
        <button class="btn btn-success" (click)="abrirFormulario()">
          <i class="bi bi-plus-circle"></i> Nuevo Cajero
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

            <!-- Buscador + filtros -->
            <div class="row mb-3 g-2 align-items-center">
              <div class="col-md-6">
                <input type="text"
                       class="form-control"
                       placeholder="Buscar por DNI, nombres o apellidos..."
                       [ngModel]="textoBusqueda()"
                       (ngModelChange)="textoBusqueda.set($event); buscar()"
                       name="busqueda">
              </div>
              <div class="col-md-6 text-md-end">
                <div class="btn-group">
                  <button type="button" class="btn"
                          [class.btn-success]="filtroEstado() === 'TODOS'"
                          [class.btn-outline-success]="filtroEstado() !== 'TODOS'"
                          (click)="setFiltro('TODOS')">
                    Todos
                  </button>
                  <button type="button" class="btn"
                          [class.btn-success]="filtroEstado() === 'ACTIVOS'"
                          [class.btn-outline-success]="filtroEstado() !== 'ACTIVOS'"
                          (click)="setFiltro('ACTIVOS')">
                    Activos
                  </button>
                  <button type="button" class="btn"
                          [class.btn-success]="filtroEstado() === 'INACTIVOS'"
                          [class.btn-outline-success]="filtroEstado() !== 'INACTIVOS'"
                          (click)="setFiltro('INACTIVOS')">
                    Inactivos
                  </button>
                </div>
              </div>
            </div>

            <table class="table table-hover table-bordered align-middle">
              <thead class="table-dark">
                <tr>
                  <th>ID</th>
                  <th>DNI</th>
                  <th>Nombres</th>
                  <th>Apellidos</th>
                  <th>Turno</th>
                  <th>Salario</th>
                  <th>Teléfono</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (c of cajerosFiltrados(); track c.id) {
                  <tr>
                    <td>{{ c.id }}</td>
                    <td>{{ c.dni }}</td>
                    <td>{{ c.nombres }}</td>
                    <td>{{ c.apellidos }}</td>
                    <td><span class="badge bg-info text-dark">{{ c.turno }}</span></td>
                    <td class="text-end">S/. {{ c.salario }}</td>
                    <td>{{ c.telefono }}</td>
                    <td>
                      @if (c.estado) {
                        <span class="badge bg-success">Activo</span>
                      } @else {
                        <span class="badge bg-danger">Inactivo</span>
                      }
                    </td>
                    <td>
                      <button class="btn btn-warning btn-sm me-1" (click)="editar(c)" title="Editar">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn btn-danger btn-sm" (click)="eliminar(c)" title="Desactivar">
                        <i class="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="9" class="text-center text-muted py-4">
                      No hay cajeros con esos filtros.
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
                  {{ cajeroEditando.id ? 'Editar Cajero' : 'Nuevo Cajero' }}
                </h5>
                <button type="button" class="btn-close btn-close-white" (click)="cerrarFormulario()"></button>
              </div>
              <div class="modal-body">
                <form (ngSubmit)="guardar()">
                  <div class="mb-3">
                    <label class="form-label fw-bold">DNI</label>
                    <input type="text" class="form-control" name="dni"
                           [(ngModel)]="cajeroEditando.dni" maxlength="8" required>
                  </div>
                  <div class="mb-3">
                    <label class="form-label fw-bold">Nombres</label>
                    <input type="text" class="form-control" name="nombres"
                           [(ngModel)]="cajeroEditando.nombres" required>
                  </div>
                  <div class="mb-3">
                    <label class="form-label fw-bold">Apellidos</label>
                    <input type="text" class="form-control" name="apellidos"
                           [(ngModel)]="cajeroEditando.apellidos" required>
                  </div>
                  <div class="mb-3">
                    <label class="form-label fw-bold">Teléfono</label>
                    <input type="text" class="form-control" name="telefono"
                           [(ngModel)]="cajeroEditando.telefono">
                  </div>
                  <div class="mb-3">
                    <label class="form-label fw-bold">Correo</label>
                    <input type="email" class="form-control" name="correo"
                           [(ngModel)]="cajeroEditando.correo">
                  </div>
                  <div class="mb-3">
                    <label class="form-label fw-bold">Dirección</label>
                    <input type="text" class="form-control" name="direccion"
                           [(ngModel)]="cajeroEditando.direccion">
                  </div>
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label class="form-label fw-bold">Turno</label>
                      <select class="form-select" name="turno" [(ngModel)]="cajeroEditando.turno" required>
                        <option value="">Seleccione...</option>
                        <option value="MAÑANA">MAÑANA</option>
                        <option value="TARDE">TARDE</option>
                        <option value="NOCHE">NOCHE</option>
                      </select>
                    </div>
                    <div class="col-md-6 mb-3">
                      <label class="form-label fw-bold">Salario (S/.)</label>
                      <input type="number" step="0.01" min="0" class="form-control" name="salario"
                             [(ngModel)]="cajeroEditando.salario" required>
                    </div>
                    <div class="col-md-6 mb-3">
                      <label class="form-label fw-bold">Estado</label>
                      <select class="form-select" name="estado" [(ngModel)]="cajeroEditando.estado">
                        <option [ngValue]="true">Activo</option>
                        <option [ngValue]="false">Inactivo</option>
                      </select>
                    </div>
                  </div>
                  <div class="text-end">
                    <button type="button" class="btn btn-secondary me-2" (click)="cerrarFormulario()">
                      Cancelar
                    </button>
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
export class CajerosComponent implements OnInit {
  private cajeroService = inject(CajeroService);

  cajeros = signal<Cajero[]>([]);
  cajerosFiltrados = signal<Cajero[]>([]);
  cargando = signal(true);
  guardando = signal(false);
  mostrarFormulario = signal(false);
  mensaje = signal('');
  error = signal('');

  filtroEstado = signal<'TODOS' | 'ACTIVOS' | 'INACTIVOS'>('TODOS');
  textoBusqueda = signal('');

  cajeroEditando: Cajero = this.cajeroVacio();

  ngOnInit(): void {
    this.cargar();
  }

  private cargar(): void {
    this.cargando.set(true);
    this.cajeroService.listarTodos().subscribe({
      next: (data) => {
        this.cajeros.set(data);
        this.aplicarFiltros();
        this.cargando.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set('Error al cargar cajeros.');
        this.cargando.set(false);
      }
    });
  }

  aplicarFiltros(): void {
    const texto = this.textoBusqueda().toLowerCase().trim();
    const estado = this.filtroEstado();
    let lista = this.cajeros();

    if (estado === 'ACTIVOS') {
      lista = lista.filter(c => c.estado === true);
    } else if (estado === 'INACTIVOS') {
      lista = lista.filter(c => c.estado === false);
    }

    if (texto) {
      lista = lista.filter(c =>
        (c.dni ?? '').toLowerCase().includes(texto) ||
        (c.nombres ?? '').toLowerCase().includes(texto) ||
        (c.apellidos ?? '').toLowerCase().includes(texto)
      );
    }

    this.cajerosFiltrados.set(lista);
  }

  setFiltro(estado: 'TODOS' | 'ACTIVOS' | 'INACTIVOS'): void {
    this.filtroEstado.set(estado);
    this.aplicarFiltros();
  }

  buscar(): void {
    this.aplicarFiltros();
  }

  private cajeroVacio(): Cajero {
    return {
      dni: '',
      nombres: '',
      apellidos: '',
      telefono: '',
      correo: '',
      direccion: '',
      salario: 0,
      turno: '',
      estado: true
    };
  }

  abrirFormulario(): void {
    this.cajeroEditando = this.cajeroVacio();
    this.mostrarFormulario.set(true);
  }

  editar(c: Cajero): void {
    this.cajeroEditando = { ...c };
    this.mostrarFormulario.set(true);
  }

  cerrarFormulario(): void {
    this.mostrarFormulario.set(false);
  }

  guardar(): void {
    if (!this.cajeroEditando.dni?.trim() ||
        !this.cajeroEditando.nombres?.trim() ||
        !this.cajeroEditando.apellidos?.trim() ||
        !this.cajeroEditando.turno?.trim()) {
      this.error.set('DNI, nombres, apellidos y turno son obligatorios.');
      return;
    }

    this.guardando.set(true);
    this.error.set('');

    this.cajeroService.guardar(this.cajeroEditando).subscribe({
      next: () => {
        this.guardando.set(false);
        this.cerrarFormulario();
        this.mensaje.set(
          this.cajeroEditando.id
            ? 'Cajero actualizado correctamente.'
            : 'Cajero creado correctamente.'
        );
        this.cargar();
      },
      error: (err) => {
        this.guardando.set(false);
        if (err.status === 200) {
          this.cerrarFormulario();
          this.mensaje.set('Cajero guardado correctamente.');
          this.cargar();
          return;
        }
        console.error(err);
        this.error.set(typeof err?.error === 'string' ? err.error : 'Error al guardar el cajero.');
      }
    });
  }

  eliminar(c: Cajero): void {
    if (!confirm(`¿Desactivar al cajero ${c.nombres} ${c.apellidos}?`)) return;

    this.cajeroService.eliminar(c.id!).subscribe({
      next: () => {
        this.mensaje.set('Cajero desactivado correctamente.');
        this.cargar();
      },
      error: (err) => {
        console.error(err);
        this.error.set('Error al desactivar el cajero.');
      }
    });
  }
}