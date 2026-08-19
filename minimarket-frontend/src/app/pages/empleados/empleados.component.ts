import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CajeroService } from '../../core/services/cajero.service';
import { ReponedorService } from '../../core/services/reponedor.service';
import { Cajero, CajeroUsuarioDTO, Reponedor, ReponedorUsuarioDTO } from '../../core/models/models';

type TipoEmpleado = 'CAJERO' | 'REPONEDOR';
interface EmpleadoUI extends Cajero, Reponedor {
  tipo: TipoEmpleado;
}

@Component({
  selector: 'app-empleados',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container mt-5">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Empleados</h2>
          <p class="text-muted">Gestión de cajeros y reponedores del MiniMarket.</p>
        </div>
        <button class="btn btn-success" (click)="abrirFormulario()">
          <i class="bi bi-plus-circle"></i> Nuevo Empleado
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
            <!-- Filtros -->
            <div class="row mb-3 g-2 align-items-center">
              <div class="col-md-5">
                <input type="text" class="form-control"
                       placeholder="Buscar por DNI, nombres o apellidos..."
                       [ngModel]="textoBusqueda()"
                       (ngModelChange)="textoBusqueda.set($event); aplicarFiltros()"
                       name="busqueda">
              </div>
              <div class="col-md-4 text-md-end">
                <div class="btn-group">
                  <button type="button" class="btn"
                          [class.btn-success]="filtroTipo() === 'TODOS'"
                          [class.btn-outline-success]="filtroTipo() !== 'TODOS'"
                          (click)="setFiltroTipo('TODOS')">Todos</button>
                  <button type="button" class="btn"
                          [class.btn-success]="filtroTipo() === 'CAJERO'"
                          [class.btn-outline-success]="filtroTipo() !== 'CAJERO'"
                          (click)="setFiltroTipo('CAJERO')">Cajeros</button>
                  <button type="button" class="btn"
                          [class.btn-success]="filtroTipo() === 'REPONEDOR'"
                          [class.btn-outline-success]="filtroTipo() !== 'REPONEDOR'"
                          (click)="setFiltroTipo('REPONEDOR')">Reponedores</button>
                </div>
              </div>
              <div class="col-md-3 text-md-end">
                <div class="btn-group">
                  <button type="button" class="btn btn-sm"
                          [class.btn-success]="filtroEstado() === 'TODOS'"
                          [class.btn-outline-success]="filtroEstado() !== 'TODOS'"
                          (click)="setFiltroEstado('TODOS')">Todos</button>
                  <button type="button" class="btn btn-sm"
                          [class.btn-success]="filtroEstado() === 'ACTIVOS'"
                          [class.btn-outline-success]="filtroEstado() !== 'ACTIVOS'"
                          (click)="setFiltroEstado('ACTIVOS')">Activos</button>
                  <button type="button" class="btn btn-sm"
                          [class.btn-success]="filtroEstado() === 'INACTIVOS'"
                          [class.btn-outline-success]="filtroEstado() !== 'INACTIVOS'"
                          (click)="setFiltroEstado('INACTIVOS')">Inactivos</button>
                </div>
              </div>
            </div>

            <table class="table table-hover table-bordered align-middle">
              <thead class="table-dark">
                <tr>
                  <th>ID</th><th>DNI</th><th>Nombres</th><th>Apellidos</th>
                  <th>Tipo</th><th>Detalle</th><th>Salario</th><th>Teléfono</th>
                  <th>Estado</th><th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (e of empleadosFiltrados(); track e.id) {
                  <tr>
                    <td>{{ e.id }}</td>
                    <td>{{ e.dni }}</td>
                    <td>{{ e.nombres }}</td>
                    <td>{{ e.apellidos }}</td>
                    <td>
                      @if (e.tipo === 'CAJERO') {
                        <span class="badge bg-info text-dark">Cajero</span>
                      } @else {
                        <span class="badge bg-warning text-dark">Reponedor</span>
                      }
                    </td>
                    <td>
                      @if (e.tipo === 'CAJERO') {
                        Turno: <strong>{{ e.turno }}</strong>
                      } @else {
                        Área: <strong>{{ e.area }}</strong>
                      }
                    </td>
                    <td class="text-end">S/. {{ e.salario }}</td>
                    <td>{{ e.telefono }}</td>
                    <td>
                      @if (e.estado) { <span class="badge bg-success">Activo</span> }
                      @else { <span class="badge bg-danger">Inactivo</span> }
                    </td>
                    <td>
                      <button class="btn btn-warning btn-sm me-1" (click)="editar(e)" title="Editar">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn btn-danger btn-sm" (click)="eliminar(e)" title="Desactivar">
                        <i class="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                } @empty {
                  <tr><td colspan="10" class="text-center text-muted py-4">No hay empleados con esos filtros.</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

<!-- FORMULARIO DE EMPLEADOS -->
@if (mostrarFormulario()) {
  <div class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.5)">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header text-white" style="background:#2E7D32;">
          <h5 class="modal-title">
            {{ empleadoEditando.id ? 'Editar Empleado' : 'Nuevo Empleado' }}
          </h5>
          <button type="button" class="btn-close btn-close-white" (click)="cerrarFormulario()"></button>
        </div>
        <div class="modal-body">
          <form #empForm="ngForm" (ngSubmit)="guardar()">

            <!-- Tipo de empleado (solo al crear) -->
            @if (!empleadoEditando.id) {
              <div class="mb-3">
                <label class="form-label fw-bold">Tipo de Empleado</label>
                <select class="form-select" name="tipo"
                        [(ngModel)]="empleadoEditando.tipo" (ngModelChange)="onTipoChange($event)" required>
                  <option value="CAJERO">Cajero</option>
                  <option value="REPONEDOR">Reponedor</option>
                </select>
              </div>
            } @else {
              <!-- Mostrar tipo al editar (solo lectura) -->
              <div class="mb-3">
                <label class="form-label fw-bold">Tipo de Empleado</label>
                <input type="text" class="form-control" 
                       [value]="empleadoEditando.tipo === 'CAJERO' ? 'Cajero' : 'Reponedor'" 
                       disabled>
                <small class="text-muted">El tipo no se puede modificar al editar.</small>
              </div>
            }

            <div class="mb-3">
              <label class="form-label fw-bold">DNI</label>
              <input type="text" class="form-control" name="dni"
                     [(ngModel)]="empleadoEditando.dni" #dni="ngModel"
                     maxlength="8" required pattern="[0-9]{8}"
                     [class.is-invalid]="dni.invalid && dni.touched">
              @if (dni.invalid && dni.touched) {
                <small class="text-danger">Debe tener exactamente 8 dígitos.</small>
              }
            </div>

            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label fw-bold">Nombres</label>
                <input type="text" class="form-control" name="nombres"
                       [(ngModel)]="empleadoEditando.nombres" #nombres="ngModel"
                       required pattern="[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+"
                       [class.is-invalid]="nombres.invalid && nombres.touched">
                @if (nombres.invalid && nombres.touched) {
                  <small class="text-danger">Solo letras y espacios.</small>
                }
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label fw-bold">Apellidos</label>
                <input type="text" class="form-control" name="apellidos"
                       [(ngModel)]="empleadoEditando.apellidos" #apellidos="ngModel"
                       required pattern="[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+"
                       [class.is-invalid]="apellidos.invalid && apellidos.touched">
                @if (apellidos.invalid && apellidos.touched) {
                  <small class="text-danger">Solo letras y espacios.</small>
                }
              </div>
            </div>

            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label fw-bold">Teléfono</label>
                <input type="text" class="form-control" name="telefono"
                       [(ngModel)]="empleadoEditando.telefono" #tel="ngModel"
                       required pattern="[0-9]{7,9}"
                       [class.is-invalid]="tel.invalid && tel.touched">
                @if (tel.invalid && tel.touched) {
                  <small class="text-danger">Solo números (7-9).</small>
                }
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label fw-bold">Correo</label>
                <input type="email" class="form-control" name="correo"
                       [(ngModel)]="empleadoEditando.correo" #correo="ngModel"
                       required pattern="^[a-zA-Z0-9._%+-]+@gmail\\.com$"
                       [class.is-invalid]="correo.invalid && correo.touched">
                @if (correo.invalid && correo.touched) {
                  <small class="text-danger">Debe ser un correo &#64;gmail.com</small>
                }
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label fw-bold">Dirección</label>
              <input type="text" class="form-control" name="direccion"
                     [(ngModel)]="empleadoEditando.direccion">
            </div>

            <div class="row">
              <!-- Turno (solo para CAJERO) -->
              @if (empleadoEditando.tipo === 'CAJERO') {
                <div class="col-md-6 mb-3">
                  <label class="form-label fw-bold">Turno</label>
                  <select class="form-select" name="turno" [(ngModel)]="empleadoEditando.turno" required>
                    <option value="">Seleccione...</option>
                    <option value="MAÑANA">MAÑANA</option>
                    <option value="TARDE">TARDE</option>
                    <option value="NOCHE">NOCHE</option>
                  </select>
                </div>
              } @else {
                <div class="col-md-6 mb-3">
                  <label class="form-label fw-bold">Área</label>
                  <select class="form-select" name="area" [(ngModel)]="empleadoEditando.area" required>
                    <option value="">Seleccione...</option>
                    <option value="ALMACEN">Almacén</option>
                    <option value="FRUTAS">Frutas</option>
                    <option value="LACTEOS">Lácteos</option>
                    <option value="ABARROTES">Abarrotes</option>
                  </select>
                </div>
              }
              <div class="col-md-6 mb-3">
                <label class="form-label fw-bold">Salario (S/.)</label>
                <input type="number" step="0.01" min="0" class="form-control" name="salario"
                       [(ngModel)]="empleadoEditando.salario" required>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label fw-bold">Estado</label>
                <select class="form-select" name="estado" [(ngModel)]="empleadoEditando.estado">
                  <option [ngValue]="true">Activo</option>
                  <option [ngValue]="false">Inactivo</option>
                </select>
              </div>
            </div>

            <!-- CAMPOS DE USUARIO (Solo al crear nuevo) -->
            @if (!empleadoEditando.id) {
              <hr>
              <h6 class="fw-bold text-success">Datos de acceso al sistema</h6>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label fw-bold">Usuario</label>
                  <input type="text" class="form-control" name="username"
                         [(ngModel)]="username" #user="ngModel"
                         required pattern="[a-zA-Z0-9_]{4,20}"
                         [class.is-invalid]="user.invalid && user.touched">
                  @if (user.invalid && user.touched) {
                    <small class="text-danger">Letras, números o guion bajo (4-20).</small>
                  }
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label fw-bold">Contraseña</label>
                  <input type="password" class="form-control" name="password"
                         [(ngModel)]="password" #pass="ngModel"
                         required minlength="4"
                         [class.is-invalid]="pass.invalid && pass.touched">
                  @if (pass.invalid && pass.touched) {
                    <small class="text-danger">Mínimo 4 caracteres.</small>
                  }
                </div>
              </div>
            }

            <div class="text-end">
              <button type="button" class="btn btn-secondary me-2" (click)="cerrarFormulario()">Cancelar</button>
              <button type="submit" class="btn btn-success" [disabled]="empForm.invalid || guardando()">
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
export class EmpleadosComponent implements OnInit {
  private cajeroService = inject(CajeroService);
  private reponedorService = inject(ReponedorService);

  empleados = signal<EmpleadoUI[]>([]);
  empleadosFiltrados = signal<EmpleadoUI[]>([]);
  cargando = signal(true);
  guardando = signal(false);
  mostrarFormulario = signal(false);
  mensaje = signal('');
  error = signal('');

  filtroTipo = signal<'TODOS' | 'CAJERO' | 'REPONEDOR'>('TODOS');
  filtroEstado = signal<'TODOS' | 'ACTIVOS' | 'INACTIVOS'>('TODOS');
  textoBusqueda = signal('');

  empleadoEditando: EmpleadoUI = this.empleadoVacio();
  
  // Variables para las credenciales
  username: string = '';
  password: string = '';

  ngOnInit(): void {
    this.cargar();
  }

  private cargar(): void {
    this.cargando.set(true);
    Promise.all([
      this.cajeroService.listarTodos().toPromise(),
      this.reponedorService.listarTodos().toPromise()
    ]).then(([cajeros, reponedores]) => {
      const lista: EmpleadoUI[] = [];
      (cajeros ?? []).forEach(c => lista.push({ ...c, tipo: 'CAJERO', area: '' }));
      (reponedores ?? []).forEach(r => lista.push({ ...r, tipo: 'REPONEDOR', turno: '' }));
      this.empleados.set(lista);
      this.aplicarFiltros();
      this.cargando.set(false);
    }).catch(err => {
      console.error(err);
      this.error.set('Error al cargar empleados.');
      this.cargando.set(false);
    });
  }

  aplicarFiltros(): void {
    const texto = this.textoBusqueda().toLowerCase().trim();
    const estado = this.filtroEstado();
    const tipo = this.filtroTipo();
    let lista = this.empleados();

    if (tipo !== 'TODOS') lista = lista.filter(e => e.tipo === tipo);
    if (estado === 'ACTIVOS') lista = lista.filter(e => e.estado === true);
    else if (estado === 'INACTIVOS') lista = lista.filter(e => e.estado === false);
    if (texto) {
      lista = lista.filter(e =>
        (e.dni ?? '').toLowerCase().includes(texto) ||
        (e.nombres ?? '').toLowerCase().includes(texto) ||
        (e.apellidos ?? '').toLowerCase().includes(texto)
      );
    }
    this.empleadosFiltrados.set(lista);
  }

  setFiltroTipo(t: 'TODOS' | 'CAJERO' | 'REPONEDOR'): void { this.filtroTipo.set(t); this.aplicarFiltros(); }
  setFiltroEstado(e: 'TODOS' | 'ACTIVOS' | 'INACTIVOS'): void { this.filtroEstado.set(e); this.aplicarFiltros(); }

  private empleadoVacio(): EmpleadoUI {
    return {
      dni: '', nombres: '', apellidos: '', telefono: '', correo: '',
      direccion: '', salario: 0, turno: '', area: '', estado: true,
      tipo: 'CAJERO', fechaIngreso: new Date().toISOString().split('T')[0]
    };
  }

  abrirFormulario(): void {
    this.empleadoEditando = this.empleadoVacio();
    this.username = '';
    this.password = '';
    this.mostrarFormulario.set(true);
  }

  editar(e: EmpleadoUI): void {
    this.empleadoEditando = { ...e };
    this.mostrarFormulario.set(true);
  }

  cerrarFormulario(): void {
    this.mostrarFormulario.set(false);
  }

  onTipoChange(tipo: TipoEmpleado): void {
    this.empleadoEditando.tipo = tipo;
    if (tipo === 'CAJERO') this.empleadoEditando.area = '';
    else this.empleadoEditando.turno = '';
  }

  guardar(): void {
    this.guardando.set(true);
    this.error.set('');

    if (this.empleadoEditando.tipo === 'CAJERO') {
      const cajero: Cajero = {
        id: this.empleadoEditando.id,
        dni: this.empleadoEditando.dni,
        nombres: this.empleadoEditando.nombres,
        apellidos: this.empleadoEditando.apellidos,
        telefono: this.empleadoEditando.telefono,
        correo: this.empleadoEditando.correo,
        direccion: this.empleadoEditando.direccion,
        salario: this.empleadoEditando.salario,
        turno: this.empleadoEditando.turno,
        estado: this.empleadoEditando.estado,
        fechaIngreso: this.empleadoEditando.fechaIngreso || new Date().toISOString().split('T')[0]
      };

      // SI ES NUEVO (USA DTO)
      if (!cajero.id) {
        const dto: CajeroUsuarioDTO = {
          cajero: cajero,
          username: this.username,
          password: this.password
        };
        this.cajeroService.crearConUsuario(dto).subscribe({
          next: () => this.onGuardadoExitoso(),
          error: (err) => this.onGuardadoError(err)
        });
      } 
      // SI ES EDICIÓN (USA MÉTODO NORMAL)
      else {
        this.cajeroService.guardar(cajero).subscribe({
          next: () => this.onGuardadoExitoso(),
          error: (err) => this.onGuardadoError(err)
        });
      }

    } else {
      const reponedor: Reponedor = {
        id: this.empleadoEditando.id,
        dni: this.empleadoEditando.dni,
        nombres: this.empleadoEditando.nombres,
        apellidos: this.empleadoEditando.apellidos,
        telefono: this.empleadoEditando.telefono,
        correo: this.empleadoEditando.correo,
        direccion: this.empleadoEditando.direccion,
        salario: this.empleadoEditando.salario,
        area: this.empleadoEditando.area,
        estado: this.empleadoEditando.estado,
        fechaIngreso: this.empleadoEditando.fechaIngreso || new Date().toISOString().split('T')[0]
      };
      // SI ES NUEVO (USA DTO)
      if (!reponedor.id) {
        const dto: ReponedorUsuarioDTO = {
          reponedor: reponedor,
          username: this.username,
          password: this.password
        };
        this.reponedorService.crearConUsuario(dto).subscribe({
          next: () => this.onGuardadoExitoso(),
          error: (err) => this.onGuardadoError(err)
        });
      } 
      // SI ES EDICIÓN (USA MÉTODO NORMAL)
      else {
        this.reponedorService.guardar(reponedor).subscribe({
          next: () => this.onGuardadoExitoso(),
          error: (err) => this.onGuardadoError(err)
        });
      }
    }
  }

  private onGuardadoExitoso(): void {
    this.guardando.set(false);
    this.cerrarFormulario();
    this.mensaje.set(this.empleadoEditando.id
      ? 'Empleado actualizado correctamente.'
      : 'Empleado y usuario creados con éxito.');
    this.cargar();
  }

  private onGuardadoError(err: any): void {
    this.guardando.set(false);
    console.error(err);
    const msg = err.error?.mensaje || err.error?.message || err.error;
    this.error.set(typeof msg === 'string' ? msg : 'Error al guardar el empleado.');
  }

  eliminar(e: EmpleadoUI): void {
    if (!confirm(`¿Desactivar al empleado ${e.nombres} ${e.apellidos}?`)) return;
    if (e.tipo === 'CAJERO') {
      this.cajeroService.eliminar(e.id!).subscribe({
        next: () => { this.mensaje.set('Cajero desactivado correctamente.'); this.cargar(); },
        error: () => this.error.set('Error al desactivar el cajero.')
      });
    } else {
      this.reponedorService.eliminar(e.id!).subscribe({
        next: () => { this.mensaje.set('Reponedor desactivado correctamente.'); this.cargar(); },
        error: () => this.error.set('Error al desactivar el reponedor.')
      });
    }
  }
}