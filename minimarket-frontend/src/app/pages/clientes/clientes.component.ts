import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClienteService } from '../../core/services/cliente.service';
import { Cliente } from '../../core/models/models';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container mt-5">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Clientes</h2>
          <p class="text-muted">Gestión de clientes registrados en MiniMarket.</p>
        </div>
        <button class="btn btn-success" (click)="abrirFormulario()">
          <i class="bi bi-plus-circle"></i> Nuevo Cliente
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
                  <th>ID</th><th>DNI</th><th>Nombres</th><th>Apellidos</th>
                  <th>Teléfono</th><th>Correo</th><th>Estado</th><th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (c of clientes(); track c.id) {
                  <tr>
                    <td>{{ c.id }}</td>
                    <td>{{ c.dni }}</td>
                    <td>{{ c.nombres }}</td>
                    <td>{{ c.apellidos }}</td>
                    <td>{{ c.telefono }}</td>
                    <td>{{ c.correo }}</td>
                    <td>
                      @if (c.estado) { <span class="badge bg-success">Activo</span> }
                      @else { <span class="badge bg-danger">Inactivo</span> }
                    </td>
                    <td>
                      <button class="btn btn-warning btn-sm me-1" (click)="editar(c)">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn btn-danger btn-sm" (click)="eliminar(c)">
                        <i class="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                } @empty {
                  <tr><td colspan="8" class="text-center text-muted py-4">No hay clientes.</td></tr>
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
                  {{ clienteEditando.id ? 'Editar Cliente' : 'Nuevo Cliente' }}
                </h5>
                <button type="button" class="btn-close btn-close-white" (click)="cerrarFormulario()"></button>
              </div>
              <div class="modal-body">
                <form (ngSubmit)="guardar()">
                  <div class="mb-3">
                    <label class="form-label fw-bold">DNI</label>
                    <input type="text" class="form-control" name="dni"
                           [(ngModel)]="clienteEditando.dni" maxlength="8" required>
                  </div>
                  <div class="mb-3">
                    <label class="form-label fw-bold">Nombres</label>
                    <input type="text" class="form-control" name="nombres"
                           [(ngModel)]="clienteEditando.nombres" required>
                  </div>
                  <div class="mb-3">
                    <label class="form-label fw-bold">Apellidos</label>
                    <input type="text" class="form-control" name="apellidos"
                           [(ngModel)]="clienteEditando.apellidos" required>
                  </div>
                  <div class="mb-3">
                    <label class="form-label fw-bold">Teléfono</label>
                    <input type="text" class="form-control" name="telefono"
                           [(ngModel)]="clienteEditando.telefono">
                  </div>
                  <div class="mb-3">
                    <label class="form-label fw-bold">Correo</label>
                    <input type="email" class="form-control" name="correo"
                           [(ngModel)]="clienteEditando.correo">
                  </div>
                  <div class="mb-3">
                    <label class="form-label fw-bold">Dirección</label>
                    <input type="text" class="form-control" name="direccion"
                           [(ngModel)]="clienteEditando.direccion">
                  </div>
                  <div class="mb-3">
                    <label class="form-label fw-bold">Estado</label>
                    <select class="form-select" name="estado" [(ngModel)]="clienteEditando.estado">
                      <option [ngValue]="true">Activo</option>
                      <option [ngValue]="false">Inactivo</option>
                    </select>
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
export class ClientesComponent implements OnInit {
  private clienteService = inject(ClienteService);

  clientes = signal<Cliente[]>([]);
  cargando = signal(true);
  guardando = signal(false);
  mostrarFormulario = signal(false);
  mensaje = signal('');
  error = signal('');

  clienteEditando: Cliente = this.clienteVacio();

  ngOnInit(): void {
    this.cargar();
  }

  private cargar(): void {
    this.cargando.set(true);
    this.clienteService.listar().subscribe({
      next: (data) => { this.clientes.set(data); this.cargando.set(false); },
      error: (err) => { console.error(err); this.cargando.set(false); }
    });
  }

  private clienteVacio(): Cliente {
    return { dni: '', nombres: '', apellidos: '', telefono: '', correo: '', direccion: '', estado: true };
  }

  abrirFormulario(): void {
    this.clienteEditando = this.clienteVacio();
    this.mostrarFormulario.set(true);
  }

  editar(c: Cliente): void {
    this.clienteEditando = { ...c };
    this.mostrarFormulario.set(true);
  }

  cerrarFormulario(): void {
    this.mostrarFormulario.set(false);
  }

  guardar(): void {
    this.guardando.set(true);
    this.error.set('');
    this.clienteService.guardar(this.clienteEditando).subscribe({
      next: () => {
        this.guardando.set(false);
        this.cerrarFormulario();
        this.mensaje.set('Cliente guardado correctamente.');
        this.cargar();
      },
      error: (err) => {
        this.guardando.set(false);
        this.error.set('Error al guardar el cliente.');
        console.error(err);
      }
    });
  }

  eliminar(c: Cliente): void {
    if (!confirm(`¿Eliminar al cliente ${c.nombres} ${c.apellidos}?`)) return;
    this.clienteService.eliminar(c.id!).subscribe({
      next: () => {
        this.mensaje.set('Cliente eliminado correctamente.');
        this.cargar();
      },
      error: (err) => {
        this.error.set('Error al eliminar el cliente.');
        console.error(err);
      }
    });
  }
}
