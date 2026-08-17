import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { WhatsAppService } from '../../core/services/whatsapp.service';
import { PedidoWhatsApp } from '../../core/models/models';

@Component({
  selector: 'app-pedidos-whatsapp',
  standalone: true,
  imports: [FormsModule, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- El template se mantiene igual -->
    <div class="container mt-4">
      <!-- Header -->
      <div class="card shadow border-0 mb-4">
        <div class="card-header text-white" style="background:linear-gradient(135deg,#128C7E 0%,#25D366 100%);">
          <h4 class="mb-0">
            <i class="bi bi-whatsapp me-2"></i>
            Atención al Cliente — Pedidos por WhatsApp
          </h4>
        </div>
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

      <!-- Estadísticas rápidas -->
      <div class="row mb-4">
        <div class="col-md-3 mb-3">
          <div class="card text-white bg-warning h-100">
            <div class="card-body text-center">
              <h6>Pendientes</h6>
              <h2>{{ pendientes().length }}</h2>
            </div>
          </div>
        </div>
        <div class="col-md-3 mb-3">
          <div class="card text-white bg-info h-100">
            <div class="card-body text-center">
              <h6>En Proceso</h6>
              <h2>{{ enProceso().length }}</h2>
            </div>
          </div>
        </div>
        <div class="col-md-3 mb-3">
          <div class="card text-white bg-primary h-100">
            <div class="card-body text-center">
              <h6>Pedidos</h6>
              <h2>{{ pedidos().length }}</h2>
            </div>
          </div>
        </div>
        <div class="col-md-3 mb-3">
          <div class="card text-white bg-secondary h-100">
            <div class="card-body text-center">
              <h6>Consultas</h6>
              <h2>{{ consultas().length }}</h2>
            </div>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="row mb-3">
        <div class="col-md-6">
          <div class="btn-group">
            <button class="btn" [class.btn-success]="filtro() === 'TODOS'"
                    [class.btn-outline-success]="filtro() !== 'TODOS'"
                    (click)="setFiltro('TODOS')">Todos</button>
            <button class="btn" [class.btn-success]="filtro() === 'PENDIENTE'"
                    [class.btn-outline-success]="filtro() !== 'PENDIENTE'"
                    (click)="setFiltro('PENDIENTE')">Pendientes</button>
            <button class="btn" [class.btn-success]="filtro() === 'EN_PROCESO'"
                    [class.btn-outline-success]="filtro() !== 'EN_PROCESO'"
                    (click)="setFiltro('EN_PROCESO')">En Proceso</button>
            <button class="btn" [class.btn-success]="filtro() === 'ATENDIDO'"
                    [class.btn-outline-success]="filtro() !== 'ATENDIDO'"
                    (click)="setFiltro('ATENDIDO')">Atendidos</button>
          </div>
        </div>
        <div class="col-md-6 text-md-end">
          <button class="btn btn-success" (click)="cargar()">
            <i class="bi bi-arrow-clockwise"></i> Actualizar
          </button>
        </div>
      </div>

      <!-- Lista de pedidos -->
      @if (cargando()) {
        <div class="text-center py-5"><div class="spinner-border text-success" role="status"></div></div>
      } @else {
        <div class="row">
          @for (p of pedidosFiltrados(); track p.id) {
            <div class="col-md-6 mb-3">
              <div class="card shadow" [class.border-warning]="p.estado === 'PENDIENTE'"
                   [class.border-info]="p.estado === 'EN_PROCESO'"
                   [class.border-success]="p.estado === 'ATENDIDO'">
                <div class="card-header d-flex justify-content-between align-items-center">
                  <div>
                    <i class="bi bi-person-circle me-1"></i>
                    <strong>{{ p.nombreRemitente || 'Cliente' }}</strong>
                  </div>
                  @if (p.tipo === 'PEDIDO') {
                    <span class="badge bg-primary">📦 Pedido</span>
                  } @else if (p.tipo === 'CONSULTA') {
                    <span class="badge bg-secondary">❓ Consulta</span>
                  } @else {
                    <span class="badge bg-warning text-dark">Nuevo</span>
                  }
                </div>
                <div class="card-body">
                  <p class="text-muted small mb-2">
                    <i class="bi bi-whatsapp me-1"></i>{{ p.numeroRemitente }}
                    <span class="ms-3"><i class="bi bi-clock me-1"></i>{{ p.fechaRegistro | date:'dd/MM/yyyy HH:mm' }}</span>
                  </p>
                  <p class="card-text">{{ p.mensaje }}</p>

                  @if (p.estado === 'ATENDIDO' && p.respuesta) {
                    <div class="alert alert-success mt-2 mb-0">
                      <strong>Respuesta:</strong> {{ p.respuesta }}
                    </div>
                  }

                  <div class="mt-2">
                    @switch (p.estado) {
                      @case ('PENDIENTE') {
                        <span class="badge bg-warning text-dark">⏳ Pendiente</span>
                      }
                      @case ('EN_PROCESO') {
                        <span class="badge bg-info text-dark">👁 En revisión</span>
                      }
                      @case ('ATENDIDO') {
                        <span class="badge bg-success">✅ Atendido</span>
                      }
                      @default {
                        <span class="badge bg-secondary">{{ p.estado }}</span>
                      }
                    }
                  </div>
                </div>

                @if (p.estado !== 'ATENDIDO') {
                  <div class="card-footer">
                    @if (p.estado === 'PENDIENTE') {
                      <button class="btn btn-info btn-sm me-2" (click)="marcarEnProceso(p.id!)">
                        <i class="bi bi-eye"></i> Revisar
                      </button>
                    }
                    <button class="btn btn-success btn-sm" (click)="abrirResponder(p)">
                      <i class="bi bi-reply"></i> Responder
                    </button>
                  </div>
                }
              </div>
            </div>
          } @empty {
            <div class="col-12">
              <div class="card shadow text-center">
                <div class="card-body p-5">
                  <i class="bi bi-inbox fs-1 text-muted"></i>
                  <h4 class="mt-3 text-muted">No hay pedidos {{ filtro() === 'TODOS' ? '' : 'con ese filtro' }}</h4>
                  <p class="text-muted">Los mensajes que recibas por WhatsApp aparecerán aquí.</p>
                </div>
              </div>
            </div>
          }
        </div>
      }

      <!-- Modal responder -->
      @if (mostrarResponder()) {
        <div class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.5)">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header text-white" style="background:#128C7E;">
                <h5 class="modal-title">
                  <i class="bi bi-whatsapp me-2"></i>Responder a {{ pedidoActual()?.nombreRemitente || 'Cliente' }}
                </h5>
                <button type="button" class="btn-close btn-close-white" (click)="cerrarResponder()"></button>
              </div>
              <div class="modal-body">
                <div class="mb-3">
                  <label class="form-label fw-bold">Mensaje original:</label>
                  <p class="bg-light p-2 rounded">{{ pedidoActual()?.mensaje }}</p>
                </div>
                <div class="mb-3">
                  <label class="form-label fw-bold">Tu respuesta:</label>
                  <textarea class="form-control" rows="4"
                            [(ngModel)]="textoRespuesta"
                            placeholder="Escribe tu respuesta..."></textarea>
                </div>
                <div class="alert alert-info">
                  <i class="bi bi-info-circle"></i>
                  Esta respuesta se enviará automáticamente por WhatsApp al cliente.
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" (click)="cerrarResponder()">Cancelar</button>
                <button type="button" class="btn btn-success" (click)="enviarRespuesta()" [disabled]="guardando()">
                  @if (guardando()) {
                    <span class="spinner-border spinner-border-sm"></span> Enviando...
                  } @else {
                    <i class="bi bi-whatsapp"></i> Enviar por WhatsApp
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
export class PedidosWhatsAppComponent implements OnInit {
  private whatsappService = inject(WhatsAppService);

  todos = signal<PedidoWhatsApp[]>([]);
  cargando = signal(true);
  guardando = signal(false);
  mostrarResponder = signal(false);
  mensaje = signal('');
  error = signal('');

  filtro = signal<'TODOS' | 'PENDIENTE' | 'EN_PROCESO' | 'ATENDIDO'>('TODOS');

  pedidoActual = signal<PedidoWhatsApp | null>(null);
  textoRespuesta = '';

  // Computeds: se actualizan automáticamente cuando 'todos' o 'filtro' cambian
  pendientes = computed(() => this.todos().filter(p => p.estado === 'PENDIENTE'));
  enProceso = computed(() => this.todos().filter(p => p.estado === 'EN_PROCESO'));
  pedidos = computed(() => this.todos().filter(p => p.tipo === 'PEDIDO'));
  consultas = computed(() => this.todos().filter(p => p.tipo === 'CONSULTA'));

  pedidosFiltrados = computed(() => {
    const f = this.filtro();
    if (f === 'TODOS') return this.todos();
    return this.todos().filter(p => p.estado === f);
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.whatsappService.listarTodos().subscribe({
      next: (data) => {
        this.todos.set(data);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('Error al cargar pedidos.');
        this.cargando.set(false);
      }
    });
  }

  setFiltro(f: 'TODOS' | 'PENDIENTE' | 'EN_PROCESO' | 'ATENDIDO'): void {
    this.filtro.set(f);
  }

  marcarEnProceso(id: number): void {
    this.whatsappService.marcarEnProceso(id).subscribe({
      next: () => {
        this.mensaje.set('Pedido marcado en revisión.');
        this.cargar(); // recargamos para reflejar el cambio
      },
      error: () => this.error.set('Error al marcar.')
    });
  }

  abrirResponder(p: PedidoWhatsApp): void {
    this.pedidoActual.set(p);
    this.textoRespuesta = '';
    this.mostrarResponder.set(true);
    if (p.estado === 'PENDIENTE') {
      this.whatsappService.marcarEnProceso(p.id!).subscribe();
    }
  }

  cerrarResponder(): void {
    this.mostrarResponder.set(false);
  }

  enviarRespuesta(): void {
    const p = this.pedidoActual();
    if (!p?.id || !this.textoRespuesta.trim()) return;
    this.guardando.set(true);
    this.whatsappService.atender(p.id, this.textoRespuesta).subscribe({
      next: () => {
        this.guardando.set(false);
        this.cerrarResponder();
        this.mensaje.set('Respuesta enviada por WhatsApp al cliente. ✅');
        this.cargar(); // recargamos para reflejar el cambio
      },
      error: () => {
        this.guardando.set(false);
        this.error.set('Error al enviar respuesta.');
      }
    });
  }
}