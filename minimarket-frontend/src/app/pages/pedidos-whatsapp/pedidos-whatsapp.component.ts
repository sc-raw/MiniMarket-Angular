// pedidos-whatsapp.component.ts
import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { WhatsAppService } from '../../core/services/whatsapp.service';
import { ClienteService } from '../../core/services/cliente.service';
import { CajeroService } from '../../core/services/cajero.service';
import { ProductoService } from '../../core/services/producto.service';
import { PedidoWhatsApp, Cliente, Cajero, Producto, DetalleVentaRequest } from '../../core/models/models';

interface ItemConvertir {
  productoId: number | null;
  cantidad: number;
}

@Component({
  selector: 'app-pedidos-whatsapp',
  standalone: true,
  imports: [FormsModule, DatePipe],
  template: `
    <div class="container-fluid mt-3">
      <div class="row mb-2">
        <div class="col">
          <h3 class="mb-0">💬 Atención al Cliente — Pedidos WhatsApp</h3>
          <small class="text-muted">Auto-refresh cada 15s · {{ pedidos().length }} conversaciones</small>
        </div>
        <div class="col-auto">
          <button class="btn btn-outline-success btn-sm" (click)="cargar()">
            <i class="bi bi-arrow-clockwise"></i> Actualizar
          </button>
        </div>
      </div>

      <!-- Barra de búsqueda + filtros -->
      <div class="row mb-3 g-2">
        <div class="col-md-5">
          <div class="input-group input-group-sm">
            <span class="input-group-text"><i class="bi bi-search"></i></span>
            <input type="text" class="form-control" placeholder="Buscar por nombre o teléfono..."
                   [ngModel]="busqueda()" (ngModelChange)="busqueda.set($event)">
          </div>
        </div>
        <div class="col-md-7">
          <div class="btn-group w-100 btn-group-sm" role="group">
            <button class="btn" [class.btn-success]="filtro()=='TODOS'"
                    [class.btn-outline-success]="filtro()!='TODOS'"
                    (click)="filtro.set('TODOS')">
              Todos <span class="badge bg-light text-dark">{{ pedidos().length }}</span>
            </button>
            <button class="btn" [class.btn-warning]="filtro()=='PENDIENTE'"
                    [class.btn-outline-warning]="filtro()!='PENDIENTE'"
                    (click)="filtro.set('PENDIENTE')">
              Pendientes <span class="badge bg-light text-dark">{{ countPendientes() }}</span>
            </button>
            <button class="btn" [class.btn-primary]="filtro()=='EN_PROCESO'"
                    [class.btn-outline-primary]="filtro()!='EN_PROCESO'"
                    (click)="filtro.set('EN_PROCESO')">
              En proceso <span class="badge bg-light text-dark">{{ countEnProceso() }}</span>
            </button>
            <button class="btn" [class.btn-secondary]="filtro()=='ATENDIDO'"
                    [class.btn-outline-secondary]="filtro()!='ATENDIDO'"
                    (click)="filtro.set('ATENDIDO')">
              Atendidos <span class="badge bg-light text-dark">{{ countAtendidos() }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Layout 2 paneles estilo WhatsApp Web -->
      <div class="row" style="height: calc(100vh - 220px); min-height: 500px;">

        <!-- ===== Panel izquierdo: lista de conversaciones ===== -->
        <div class="col-md-4 col-4 pe-0">
          <div class="card h-100 shadow-sm">
            <div class="card-header bg-light py-2">
              <strong class="small">Conversaciones</strong>
            </div>
            <div class="list-group list-group-flush" style="overflow-y: auto; max-height: calc(100vh - 260px);">
              @for (p of pedidosFiltrados(); track p.id) {
                <button class="list-group-item list-group-item-action py-2 px-3 border-0 border-bottom"
                        [class.active]="pedidoSeleccionado()?.id === p.id"
                        (click)="seleccionarPedido(p)">
                  <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1 text-start">
                      <div class="fw-bold small">{{ p.nombreRemitente || 'Cliente' }}</div>
                      <div class="text-muted" style="font-size: 11px;">
                        <i class="bi bi-phone"></i> {{ p.numeroRemitente }}
                      </div>
                      <div class="text-truncate" style="font-size: 11px; max-width: 200px;">
                        {{ ultimaLinea(p.mensaje) }}
                      </div>
                    </div>
                    <div class="text-end">
                      @if (p.tipo === 'PEDIDO') {
                        <span class="badge bg-info mb-1" style="font-size: 9px;">📦 Pedido</span>
                      } @else if (p.tipo === 'CONSULTA') {
                        <span class="badge bg-secondary mb-1" style="font-size: 9px;">❓ Consulta</span>
                      } @else {
                        <span class="badge bg-light text-dark mb-1" style="font-size: 9px;">Nuevo</span>
                      }
                      <div style="font-size: 10px;">
                        {{ p.fechaRegistro | date:'HH:mm' }}
                      </div>
                      <div class="mt-1">
                        @switch (p.estado) {
                          @case ('PENDIENTE')  { <span class="badge bg-warning text-dark" style="font-size: 9px;">⏳</span> }
                          @case ('EN_PROCESO') { <span class="badge bg-primary" style="font-size: 9px;">👀</span> }
                          @case ('ATENDIDO')   { <span class="badge bg-success" style="font-size: 9px;">✓</span> }
                        }
                      </div>
                    </div>
                  </div>
                </button>
              } @empty {
                <div class="text-center text-muted py-5">
                  <i class="bi bi-inbox" style="font-size: 3rem;"></i>
                  <p class="mt-2 small">No hay conversaciones con este filtro.</p>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- ===== Panel derecho: chat seleccionado ===== -->
        <div class="col-md-8 col-8 ps-0">
          <div class="card h-100 shadow-sm">
            @if (pedidoSeleccionado(); as p) {
              <!-- Header del chat -->
              <div class="card-header bg-light py-2 d-flex justify-content-between align-items-center">
                <div>
                  <strong>{{ p.nombreRemitente || 'Cliente' }}</strong>
                  <small class="text-muted ms-2">
                    <i class="bi bi-phone"></i> {{ p.numeroRemitente }}
                  </small>
                </div>
                <div>
                  @if (p.tipo === 'PEDIDO') {
                    <span class="badge bg-info">📦 Pedido</span>
                  } @else if (p.tipo === 'CONSULTA') {
                    <span class="badge bg-secondary">❓ Consulta</span>
                  }
                  @if (p.estado === 'PENDIENTE') {
                    <button class="btn btn-sm btn-primary ms-2" (click)="marcarEnProceso(p.id!)">
                      <i class="bi bi-eye"></i> Revisar
                    </button>
                  }
                  @if (p.estado !== 'ATENDIDO') {
                    <button class="btn btn-sm btn-success ms-2" (click)="abrirConvertirModal(p)"
                            [disabled]="p.tipo !== 'PEDIDO'">
                      <i class="bi bi-cart-check"></i> Convertir en Venta
                    </button>
                  }
                  @if (p.ventaId) {
                    <a class="btn btn-sm btn-info text-white ms-2" href="/ventas" routerLink="/ventas">
                      <i class="bi bi-link"></i> Venta #{{ p.ventaId }}
                    </a>
                  }
                </div>
              </div>

              <!-- Cuerpo del chat (burbujas) -->
              <div class="card-body p-3" style="overflow-y: auto; max-height: calc(100vh - 440px); background: #e5ddd5;">
                @for (msg of chatMensajes(p); track $index) {
                  @if (msg.esOperador) {
                    <div class="d-flex justify-content-end mb-2">
                      <div class="bg-success text-white rounded p-2 px-3 shadow-sm" style="max-width: 70%;">
                        <div style="font-size: 13px;">{{ msg.texto }}</div>
                        <div class="text-end" style="font-size: 9px; opacity: 0.8;">
                          <i class="bi bi-check-all"></i> Operador
                        </div>
                      </div>
                    </div>
                  } @else {
                    <div class="d-flex justify-content-start mb-2">
                      <div class="bg-white rounded p-2 px-3 shadow-sm" style="max-width: 70%;">
                        <div style="font-size: 13px;">{{ msg.texto }}</div>
                        <div class="text-end text-muted" style="font-size: 9px;">
                          Cliente
                        </div>
                      </div>
                    </div>
                  }
                }
                @if (p.respuesta && !p.mensaje?.includes('[OPERADOR]:')) {
                  <div class="d-flex justify-content-end mb-2">
                    <div class="bg-success text-white rounded p-2 px-3 shadow-sm" style="max-width: 70%;">
                      <div style="font-size: 13px;">{{ p.respuesta }}</div>
                      <div class="text-end" style="font-size: 9px; opacity: 0.8;">
                        <i class="bi bi-check-all"></i> Respuesta final
                      </div>
                    </div>
                  </div>
                }
              </div>

              <!-- Footer: respuestas rápidas + input de mensaje -->
              @if (p.estado !== 'ATENDIDO') {
                <div class="card-footer p-2">
                  <!-- Respuestas rápidas -->
                  <div class="mb-2 d-flex flex-wrap gap-1">
                    <button class="btn btn-sm btn-outline-secondary py-0" (click)="respuestaRapida('Hola, ¿cómo podemos ayudarte?')">
                      👋 Hola
                    </button>
                    <button class="btn btn-sm btn-outline-secondary py-0" (click)="respuestaRapida('Tu pedido está en proceso. 📦')">
                      📦 En proceso
                    </button>
                    <button class="btn btn-sm btn-outline-secondary py-0" (click)="respuestaRapida('¿Podrías enviarnos tu DNI para registrarte?')">
                      🪪 Pedir DNI
                    </button>
                    <button class="btn btn-sm btn-outline-secondary py-0" (click)="respuestaRapida('Gracias por tu compra 🙌')">
                      🙌 Gracias
                    </button>
                  </div>
                  <!-- Input de texto -->
                  <div class="input-group">
                    <input type="text" class="form-control" placeholder="Escribe un mensaje..."
                           [ngModel]="textoRespuesta()" (ngModelChange)="textoRespuesta.set($event)"
                           (keydown.enter)="enviarMensaje(p)">
                    <button class="btn btn-success" (click)="enviarMensaje(p)" [disabled]="!textoRespuesta().trim()">
                      <i class="bi bi-send"></i>
                    </button>
                    <button class="btn btn-outline-danger" (click)="cerrarConversacion(p)" title="Cerrar conversación (marca como atendido)">
                      <i class="bi bi-check2-circle"></i>
                    </button>
                  </div>
                  <small class="text-muted">
                    Enter para enviar · El botón verde envía sin cerrar · El botón rojo cierra la conversación
                  </small>
                </div>
              } @else {
                <div class="card-footer p-2 bg-light">
                  <small class="text-muted">
                    <i class="bi bi-check-circle text-success"></i>
                    Conversación cerrada el {{ p.fechaAtencion | date:'medium' }}
                  </small>
                </div>
              }
            } @else {
              <div class="card-body text-center text-muted py-5">
                <i class="bi bi-chat-dots" style="font-size: 4rem;"></i>
                <h5 class="mt-3">Seleccioná una conversación</h5>
                <p class="small">Elegí un pedido o consulta de la lista de la izquierda</p>
              </div>
            }
          </div>
        </div>
      </div>
    </div>

    <!-- ===== MODAL: Convertir en Venta ===== -->
    @if (mostrarConvertirModal()) {
      <div class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.6); z-index:1050;">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header text-white" style="background:linear-gradient(135deg,#0d6e6e,#198754);">
              <h5 class="modal-title">
                <i class="bi bi-cart-check"></i> Convertir Pedido en Venta
              </h5>
              <button type="button" class="btn-close btn-close-white" (click)="cerrarConvertirModal()"></button>
            </div>
            <div class="modal-body">
              @if (pedidoAConvertir(); as p) {
                <!-- Resumen del mensaje original -->
                <div class="card mb-3 bg-light">
                  <div class="card-header py-2">
                    <small class="fw-bold">Mensaje del cliente:</small>
                  </div>
                  <div class="card-body py-2">
                    <pre style="white-space: pre-wrap; font-size: 12px; margin: 0;">{{ p.mensaje }}</pre>
                  </div>
                </div>

                <div class="row mb-3">
                  <!-- Cliente -->
                  <div class="col-md-6">
                    <label class="form-label fw-bold small">Cliente</label>

                    @if (clienteEncontrado()) {
                      <!-- Cliente ya seleccionado/encontrado -->
                      <div class="alert alert-success py-2 small">
                        ✓ <strong>{{ clienteEncontrado()?.nombres }} {{ clienteEncontrado()?.apellidos }}</strong><br>
                        DNI: {{ clienteEncontrado()?.dni }}
                      </div>
                      <button class="btn btn-sm btn-link p-0" (click)="clienteEncontrado.set(null)">Cambiar cliente</button>
                    } @else {
                      <!-- Sin cliente seleccionado: puede buscar por DNI o crear nuevo -->
                      <div class="input-group input-group-sm mb-2">
                        <input type="text" class="form-control" placeholder="DNI (8 dígitos)"
                               [ngModel]="dniBuscado()" (ngModelChange)="dniBuscado.set($event)" maxlength="8">
                        <button class="btn btn-outline-success" (click)="buscarCliente()"
                                [disabled]="!dniBuscado() || dniBuscado().length !== 8">
                          <i class="bi bi-search"></i> Buscar
                        </button>
                      </div>
                      @if (buscandoCliente()) {
                        <small class="text-muted">Buscando...</small>
                      }
                      @if (mostrarFormCrearCliente()) {
                        <!-- Form para crear cliente nuevo desde el modal -->
                        <div class="card bg-light p-2 mb-2">
                          <small class="fw-bold text-success mb-1">
                            <i class="bi bi-person-plus"></i> Crear nuevo cliente
                          </small>
                          <input type="text" class="form-control form-control-sm mb-1"
                                 placeholder="Nombres"
                                 [ngModel]="nuevoClienteNombres()"
                                 (ngModelChange)="nuevoClienteNombres.set($event)">
                          <input type="text" class="form-control form-control-sm mb-1"
                                 placeholder="Apellidos"
                                 [ngModel]="nuevoClienteApellidos()"
                                 (ngModelChange)="nuevoClienteApellidos.set($event)">
                          <input type="text" class="form-control form-control-sm mb-1"
                                 placeholder="Teléfono (opcional)"
                                 [ngModel]="nuevoClienteTelefono()"
                                 (ngModelChange)="nuevoClienteTelefono.set($event)">
                          <div class="d-flex gap-1">
                            <button class="btn btn-sm btn-success flex-grow-1" (click)="crearClienteDesdeModal()"
                                    [disabled]="creandoCliente() || !nuevoClienteNombres() || !nuevoClienteApellidos() || !dniBuscado()">
                              @if (creandoCliente()) {
                                <span class="spinner-border spinner-border-sm"></span>
                              } @else {
                                <i class="bi bi-check"></i> Crear cliente
                              }
                            </button>
                            <button class="btn btn-sm btn-outline-secondary" (click)="cancelarCrearCliente()">
                              Cancelar
                            </button>
                          </div>
                        </div>
                      } @else {
                        <!-- Botones: crear nuevo o pedir DNI por WhatsApp -->
                        <div class="d-flex gap-1">
                          <button class="btn btn-sm btn-outline-success flex-grow-1" (click)="iniciarCrearCliente()">
                            <i class="bi bi-person-plus"></i> Crear nuevo
                          </button>
                          <button class="btn btn-sm btn-outline-primary" (click)="pedirDniPorWhatsApp(p)">
                            <i class="bi bi-whatsapp"></i> Pedir DNI por WhatsApp
                          </button>
                        </div>
                        <small class="text-muted d-block mt-1">
                          ℹ️ Si el DNI no existe en la BD, podés crear el cliente acá mismo
                          o pedirle el DNI al cliente por WhatsApp.
                        </small>
                      }
                    }
                  </div>

                  <!-- Cajero -->
                  <div class="col-md-6">
                    <label class="form-label fw-bold small">Cajero (cobrará la venta)</label>
                    <select class="form-select form-select-sm" [ngModel]="cajeroIdSeleccionado()"
                            (ngModelChange)="cajeroIdSeleccionado.set($event)">
                      <option [ngValue]="0">Seleccione...</option>
                      @for (c of cajeros(); track c.id) {
                        <option [ngValue]="c.id">{{ c.nombres }} {{ c.apellidos }} ({{ c.turno }})</option>
                      }
                    </select>
                  </div>
                </div>

                <!-- Items a vender -->
                <h6 class="fw-bold">
                  <i class="bi bi-bag"></i> Productos del pedido
                  <button class="btn btn-sm btn-outline-success ms-2 py-0" (click)="agregarItem()">
                    <i class="bi bi-plus"></i> Agregar
                  </button>
                </h6>
                @for (item of itemsConvertir(); track $index; let i = $index) {
                  <div class="row mb-2 g-1 align-items-end">
                    <div class="col-md-6">
                      <select class="form-select form-select-sm" [ngModel]="item.productoId"
                              (ngModelChange)="item.productoId = +$event">
                        <option [ngValue]="null">Seleccione producto...</option>
                        @for (p of productos(); track p.idProducto) {
                          <option [ngValue]="p.idProducto">{{ p.codigo }} - {{ p.nombre }} (S/. {{ p.precio }})</option>
                        }
                      </select>
                    </div>
                    <div class="col-md-2">
                      <input type="number" min="1" class="form-control form-control-sm"
                             [ngModel]="item.cantidad" (ngModelChange)="item.cantidad = +$event">
                    </div>
                    <div class="col-md-3">
                      <input type="text" class="form-control form-control-sm" [value]="subtotal(item)" readonly disabled>
                    </div>
                    <div class="col-md-1">
                      <button class="btn btn-sm btn-danger py-0" (click)="eliminarItem(i)">
                        <i class="bi bi-x"></i>
                      </button>
                    </div>
                  </div>
                }

                <div class="alert alert-success text-end mt-3">
                  <strong>Total: S/. {{ totalConvertir() }}</strong>
                </div>

                @if (errorConvertir()) {
                  <div class="alert alert-danger py-2 small">
                    <i class="bi bi-exclamation-triangle"></i> {{ errorConvertir() }}
                  </div>
                }

                <div class="modal-footer">
                  <button class="btn btn-secondary" (click)="cerrarConvertirModal()">Cancelar</button>
                  <button class="btn btn-success" (click)="confirmarConvertir()"
                          [disabled]="convirtiendo() || !clienteEncontrado() || cajeroIdSeleccionado() === 0">
                    @if (convirtiendo()) {
                      <span class="spinner-border spinner-border-sm"></span> Convirtiendo...
                    } @else {
                      <i class="bi bi-check-circle"></i> Crear Venta PENDIENTE
                    }
                  </button>
                </div>
                <small class="text-muted d-block mt-2">
                  ℹ️ La venta quedará en estado PENDIENTE. El cajero deberá ir a /ventas y cobrarla con el botón "Cobrar" para que pase a FINALIZADA.
                </small>
              }
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class PedidosWhatsAppComponent implements OnInit, OnDestroy {
  private whatsappService = inject(WhatsAppService);
  private clienteService = inject(ClienteService);
  private cajeroService = inject(CajeroService);
  private productoService = inject(ProductoService);

  pedidos = signal<PedidoWhatsApp[]>([]);
  pedidoSeleccionado = signal<PedidoWhatsApp | null>(null);
  filtro = signal<string>('TODOS');
  busqueda = signal('');
  textoRespuesta = signal('');

  // ===== Modal convertir =====
  mostrarConvertirModal = signal(false);
  pedidoAConvertir = signal<PedidoWhatsApp | null>(null);
  clienteEncontrado = signal<Cliente | null>(null);
  dniBuscado = signal('');
  buscandoCliente = signal(false);
  cajeros = signal<Cajero[]>([]);
  productos = signal<Producto[]>([]);
  cajeroIdSeleccionado = signal<number>(0);
  itemsConvertir = signal<ItemConvertir[]>([{ productoId: null, cantidad: 1 }]);
  convirtiendo = signal(false);
  errorConvertir = signal('');

  // ===== Crear cliente nuevo desde el modal =====
  mostrarFormCrearCliente = signal(false);
  nuevoClienteNombres = signal('');
  nuevoClienteApellidos = signal('');
  nuevoClienteTelefono = signal('');
  creandoCliente = signal(false);

  // ===== Computed: listado filtrado =====
  pedidosFiltrados = computed(() => {
    let lista = this.pedidos();
    const f = this.filtro();
    if (f !== 'TODOS') {
      lista = lista.filter(p => p.estado === f);
    }
    const q = this.busqueda().toLowerCase().trim();
    if (q) {
      lista = lista.filter(p =>
        (p.nombreRemitente || '').toLowerCase().includes(q) ||
        (p.numeroRemitente || '').includes(q)
      );
    }
    return lista;
  });

  countPendientes = computed(() => this.pedidos().filter(p => p.estado === 'PENDIENTE').length);
  countEnProceso = computed(() => this.pedidos().filter(p => p.estado === 'EN_PROCESO').length);
  countAtendidos = computed(() => this.pedidos().filter(p => p.estado === 'ATENDIDO').length);

  private intervalId?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.cargar();
    this.cajeroService.listar().subscribe(d => this.cajeros.set(d));
    this.productoService.listar().subscribe(d => this.productos.set(d));
    // 🔥 Auto-refresh cada 15 segundos
    this.intervalId = setInterval(() => this.cargar(), 15000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  cargar(): void {
    this.whatsappService.listarTodos().subscribe({
      next: (data) => {
        this.pedidos.set(data || []);
      },
      error: (err) => console.error('Error cargando pedidos', err)
    });
  }

  seleccionarPedido(p: PedidoWhatsApp): void {
    this.pedidoSeleccionado.set(p);
    this.textoRespuesta.set('');
    // Si está PENDIENTE, marcar en proceso automáticamente
    if (p.estado === 'PENDIENTE') {
      this.whatsappService.marcarEnProceso(p.id!).subscribe({
        next: (actualizado) => {
          // Actualizar en la lista
          this.pedidos.update(arr => arr.map(x => x.id === actualizado.id ? actualizado : x));
          this.pedidoSeleccionado.set(actualizado);
        },
        error: () => {}
      });
    }
  }

  /** Convierte el campo mensaje (string separado por " | ") en burbujas */
  chatMensajes(p: PedidoWhatsApp): { texto: string; esOperador: boolean }[] {
    if (!p.mensaje) return [];
    const partes = p.mensaje.split(' | ');
    return partes.map(parte => {
      const trimmed = parte.trim();
      const esOp = trimmed.startsWith('[OPERADOR]:');
      return {
        texto: esOp ? trimmed.substring('[OPERADOR]:'.length).trim() : trimmed,
        esOperador: esOp
      };
    });
  }

  ultimaLinea(mensaje?: string): string {
    if (!mensaje) return '';
    const partes = mensaje.split(' | ');
    return partes[partes.length - 1].replace('[OPERADOR]:', '').trim();
  }

  respuestaRapida(texto: string): void {
    this.textoRespuesta.set(texto);
  }

  enviarMensaje(p: PedidoWhatsApp): void {
    const texto = this.textoRespuesta().trim();
    if (!texto) return;
    this.whatsappService.enviarMensaje(p.id!, texto).subscribe({
      next: (actualizado) => {
        this.pedidos.update(arr => arr.map(x => x.id === actualizado.id ? actualizado : x));
        this.pedidoSeleccionado.set(actualizado);
        this.textoRespuesta.set('');
      },
      error: (err) => {
        console.error('Error enviando mensaje', err);
        alert('Error al enviar el mensaje. ¿Ngrok está corriendo?');
      }
    });
  }

  cerrarConversacion(p: PedidoWhatsApp): void {
    if (!confirm('¿Marcar esta conversación como atendida? Se enviará un mensaje al cliente.')) return;
    const texto = this.textoRespuesta().trim();
    const respuesta = texto || 'Conversación cerrada. Gracias por tu mensaje. 🙌';
    this.whatsappService.atender(p.id!, respuesta).subscribe({
      next: (actualizado) => {
        this.pedidos.update(arr => arr.map(x => x.id === actualizado.id ? actualizado : x));
        this.pedidoSeleccionado.set(actualizado);
        this.textoRespuesta.set('');
      },
      error: (err) => console.error('Error al atender', err)
    });
  }

  marcarEnProceso(id: number): void {
    this.whatsappService.marcarEnProceso(id).subscribe({
      next: (actualizado) => {
        this.pedidos.update(arr => arr.map(x => x.id === actualizado.id ? actualizado : x));
        this.pedidoSeleccionado.set(actualizado);
      },
      error: () => {}
    });
  }

  // ===== Modal Convertir en Venta =====
  abrirConvertirModal(p: PedidoWhatsApp): void {
    this.pedidoAConvertir.set(p);
    this.mostrarConvertirModal.set(true);
    this.clienteEncontrado.set(null);
    this.dniBuscado.set('');
    this.cajeroIdSeleccionado.set(0);
    this.errorConvertir.set('');
    this.itemsConvertir.set([{ productoId: null, cantidad: 1 }]);
    this.mostrarFormCrearCliente.set(false);
    this.nuevoClienteNombres.set('');
    this.nuevoClienteApellidos.set('');
    this.nuevoClienteTelefono.set('');
    // Pre-rellenar items a partir del mensaje del cliente (parser básico)
    this.parsearMensaje(p.mensaje || '');
  }

  /**
   * Parser básico del mensaje del cliente.
   * Busca:
   *  - DNI: 8 dígitos
   *  - Cantidades + producto: "2 leches", "1 coca cola"
   */
  private parsearMensaje(mensaje: string): void {
    // Buscar DNI
    const dniMatch = mensaje.match(/\b(\d{8})\b/);
    if (dniMatch) {
      this.dniBuscado.set(dniMatch[1]);
      // Buscar cliente automáticamente
      setTimeout(() => this.buscarCliente(), 200);
    }
    // Buscar items del tipo "N nombreProducto"
    // Tokeniza por comas y busca patrones "cantidad + palabras"
    const tokens = mensaje.split(/[,\n|]+/);
    const items: ItemConvertir[] = [];
    for (let token of tokens) {
      token = token.trim();
      // Saltar el token si parece ser nombre o DNI
      if (/^\d{8}$/.test(token)) continue;
      const match = token.match(/^(\d+)\s+(.+)$/);
      if (match) {
        const cantidad = parseInt(match[1], 10);
        const nombreProducto = match[2].trim();
        // Buscar producto que contenga este nombre (case-insensitive)
        const encontrado = this.productos().find(p =>
          p.nombre.toLowerCase().includes(nombreProducto.toLowerCase()) ||
          nombreProducto.toLowerCase().includes(p.nombre.toLowerCase())
        );
        if (encontrado) {
          items.push({ productoId: encontrado.idProducto!, cantidad });
        }
      }
    }
    if (items.length > 0) {
      this.itemsConvertir.set(items);
    }
  }

  cerrarConvertirModal(): void {
    this.mostrarConvertirModal.set(false);
    this.pedidoAConvertir.set(null);
    this.clienteEncontrado.set(null);
    this.dniBuscado.set('');
    this.errorConvertir.set('');
    this.mostrarFormCrearCliente.set(false);
    this.nuevoClienteNombres.set('');
    this.nuevoClienteApellidos.set('');
    this.nuevoClienteTelefono.set('');
    this.cajeroIdSeleccionado.set(0);
    this.itemsConvertir.set([{ productoId: null, cantidad: 1 }]);
  }

  buscarCliente(): void {
    const dni = this.dniBuscado().trim();
    if (!dni || dni.length !== 8) {
      this.errorConvertir.set('El DNI debe tener 8 dígitos');
      return;
    }
    this.buscandoCliente.set(true);
    this.errorConvertir.set('');
    // GET /api/clientes y filtrar por DNI
    this.clienteService.listar().subscribe({
      next: (todos) => {
        const c = todos.find(x => x.dni === dni);
        if (c) {
          this.clienteEncontrado.set(c);
        } else {
          this.errorConvertir.set('No se encontró un cliente con ese DNI. Pide al cliente que se registre en /registro.');
        }
        this.buscandoCliente.set(false);
      },
      error: () => {
        this.errorConvertir.set('Error al buscar cliente');
        this.buscandoCliente.set(false);
      }
    });
  }

  agregarItem(): void {
    this.itemsConvertir.update(arr => [...arr, { productoId: null, cantidad: 1 }]);
  }

  eliminarItem(i: number): void {
    this.itemsConvertir.update(arr => arr.filter((_, idx) => idx !== i));
  }

  subtotal(item: ItemConvertir): string {
    if (!item.productoId) return '';
    const p = this.productos().find(x => x.idProducto === item.productoId);
    if (!p) return '';
    return 'S/. ' + (p.precio * (item.cantidad || 0)).toFixed(2);
  }

  totalConvertir(): number {
    let total = 0;
    for (const item of this.itemsConvertir()) {
      if (item.productoId) {
        const p = this.productos().find(x => x.idProducto === item.productoId);
        if (p) total += p.precio * (item.cantidad || 0);
      }
    }
    return Math.round(total * 100) / 100;
  }

  confirmarConvertir(): void {
    const p = this.pedidoAConvertir();
    const cliente = this.clienteEncontrado();
    const cajeroId = this.cajeroIdSeleccionado();
    if (!p || !cliente || cajeroId === 0) {
      this.errorConvertir.set('Faltan datos: cliente o cajero');
      return;
    }
    const items = this.itemsConvertir().filter(i => i.productoId && i.cantidad > 0);
    if (items.length === 0) {
      this.errorConvertir.set('Agregá al menos un producto');
      return;
    }
    const productos: DetalleVentaRequest[] = items.map(i => ({
      productoId: i.productoId!,
      cantidad: i.cantidad
    }));
    this.convirtiendo.set(true);
    this.errorConvertir.set('');
    this.whatsappService.convertirAVenta(p.id!, {
      clienteId: cliente.id!,
      cajeroId,
      productos
    }).subscribe({
      next: (res) => {
        this.convirtiendo.set(false);
        this.cerrarConvertirModal();
        alert(`✅ Venta #${res.ventaId} creada. Total: S/. ${res.total}\nLa venta quedó PENDIENTE. El cajero debe cobrarla desde /ventas.`);
        this.cargar();
      },
      error: (err) => {
        this.convirtiendo.set(false);
        const msg = err.error?.mensaje || err.error?.message || err.message || 'Error al convertir el pedido';
        this.errorConvertir.set(typeof msg === 'string' ? msg : 'Error al convertir el pedido');
      }
    });
  }

  // ===== Crear cliente nuevo desde el modal =====

  iniciarCrearCliente(): void {
    this.mostrarFormCrearCliente.set(true);
    this.errorConvertir.set('');
    // Pre-rellenar con datos del pedido (nombre del WhatsApp + teléfono)
    const p = this.pedidoAConvertir();
    if (p) {
      // Intentar extraer nombres del mensaje del cliente
      const partes = (p.mensaje || '').split(',');
      if (partes.length >= 2) {
        const primerParte = partes[0].trim().replace(/^.*\|/, '').trim();
        // Si la primera parte parece un nombre (no es solo números), usarla
        if (primerParte && !/^\d+$/.test(primerParte) && primerParte.length > 2) {
          const palabras = primerParte.split(/\s+/);
          if (palabras.length >= 2) {
            this.nuevoClienteNombres.set(palabras[0]);
            this.nuevoClienteApellidos.set(palabras.slice(1).join(' '));
          } else {
            this.nuevoClienteNombres.set(primerParte);
          }
        }
      }
      // Teléfono: usar el número de WhatsApp sin código de país
      this.nuevoClienteTelefono.set(p.numeroRemitente || '');
    }
  }

  cancelarCrearCliente(): void {
    this.mostrarFormCrearCliente.set(false);
    this.nuevoClienteNombres.set('');
    this.nuevoClienteApellidos.set('');
    this.nuevoClienteTelefono.set('');
  }

  crearClienteDesdeModal(): void {
    const dni = this.dniBuscado().trim();
    if (!dni || dni.length !== 8) {
      this.errorConvertir.set('El DNI debe tener 8 dígitos');
      return;
    }
    if (!this.nuevoClienteNombres() || !this.nuevoClienteApellidos()) {
      this.errorConvertir.set('Nombres y apellidos son obligatorios');
      return;
    }
    this.creandoCliente.set(true);
    this.errorConvertir.set('');
    const nuevoCliente: Cliente = {
      dni,
      nombres: this.nuevoClienteNombres(),
      apellidos: this.nuevoClienteApellidos(),
      telefono: this.nuevoClienteTelefono(),
      estado: true
    };
    this.clienteService.guardar(nuevoCliente).subscribe({
      next: (c) => {
        this.creandoCliente.set(false);
        this.clienteEncontrado.set(c);
        this.mostrarFormCrearCliente.set(false);
        this.nuevoClienteNombres.set('');
        this.nuevoClienteApellidos.set('');
      },
      error: (err) => {
        this.creandoCliente.set(false);
        const msg = err.error?.message || err.error || err.message || 'Error al crear cliente';
        this.errorConvertir.set(typeof msg === 'string' ? msg : 'Error al crear cliente');
      }
    });
  }

  /** Pide el DNI al cliente por WhatsApp con un mensaje automático */
  pedirDniPorWhatsApp(p: PedidoWhatsApp): void {
    const texto = 'Hola! Para registrar tu pedido necesitamos que nos envíes tu DNI (8 dígitos). 📋';
    this.whatsappService.enviarMensaje(p.id!, texto).subscribe({
      next: (actualizado) => {
        this.pedidos.update(arr => arr.map(x => x.id === actualizado.id ? actualizado : x));
        if (this.pedidoSeleccionado()?.id === actualizado.id) {
          this.pedidoSeleccionado.set(actualizado);
        }
        alert('✅ Mensaje enviado al cliente pidiendo su DNI. Esperá su respuesta y volvé a intentarlo.');
      },
      error: () => alert('Error al enviar mensaje por WhatsApp. ¿Ngrok está corriendo?')
    });
  }
}
