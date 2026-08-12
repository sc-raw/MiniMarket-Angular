import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { CajeroService } from '../../core/services/cajero.service';
import { Cajero } from '../../core/models/models';

@Component({
  selector: 'app-cajeros',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container mt-5">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Cajeros</h2>
          <p class="text-muted">Gestión de cajeros activos.</p>
        </div>
        <button class="btn btn-success"><i class="bi bi-plus-circle"></i> Nuevo Cajero</button>
      </div>

      @if (cargando()) {
        <div class="text-center py-5"><div class="spinner-border text-success" role="status"></div></div>
      } @else {
        <div class="card shadow">
          <div class="card-body">
            <table class="table table-hover table-bordered align-middle">
              <thead class="table-dark">
                <tr>
                  <th>ID</th><th>DNI</th><th>Nombres</th><th>Apellidos</th>
                  <th>Turno</th><th>Salario</th><th>Teléfono</th>
                </tr>
              </thead>
              <tbody>
                @for (c of cajeros(); track c.id) {
                  <tr>
                    <td>{{ c.id }}</td>
                    <td>{{ c.dni }}</td>
                    <td>{{ c.nombres }}</td>
                    <td>{{ c.apellidos }}</td>
                    <td><span class="badge bg-info text-dark">{{ c.turno }}</span></td>
                    <td class="text-end">S/. {{ c.salario }}</td>
                    <td>{{ c.telefono }}</td>
                  </tr>
                } @empty {
                  <tr><td colspan="7" class="text-center text-muted py-4">
                    <i class="bi bi-exclamation-circle"></i> No existen cajeros activos.
                  </td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `
})
export class CajerosComponent implements OnInit {
  private cajeroService = inject(CajeroService);

  cajeros = signal<Cajero[]>([]);
  cargando = signal(true);

  ngOnInit(): void {
    this.cajeroService.listar().subscribe({
      next: (data) => { this.cajeros.set(data); this.cargando.set(false); },
      error: (err) => { console.error('Error al cargar cajeros', err); this.cargando.set(false); }
    });
  }
}
