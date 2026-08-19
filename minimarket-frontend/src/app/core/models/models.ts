// Modelos TypeScript que reflejan las entidades del backend Spring Boot MiniMarket.

export interface Cliente {
  id?: number;
  dni: string;
  nombres: string;
  apellidos: string;
  direccion?: string;
  telefono?: string;
  correo?: string;
  estado?: boolean;
  fechaRegistro?: string;
}

export interface Categoria {
  idCategoria?: number;
  nombre: string;
}

export interface Producto {
  idProducto?: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock?: number;
  estado?: boolean;
  fechaVencimiento?: string | null;  // ISO date (yyyy-MM-dd) o null si no perecedero
  categoria: Categoria | null;
}

export interface Empleado {
  id?: number;
  dni: string;
  nombres: string;
  apellidos: string;
  direccion?: string;
  telefono?: string;
  correo?: string;
  estado?: boolean;
  fechaIngreso?: string;
  salario?: number;
}

export interface Cajero extends Empleado {
  turno: string;
}

export interface CajeroUsuarioDTO {
  cajero: Cajero;
  username: string;
  password: string;
}

export interface Reponedor extends Empleado {
  area: string;
}

export interface ReponedorUsuarioDTO {
  reponedor: Reponedor;
  username: string;
  password: string;
}

export interface DetalleVenta {
  id?: number;
  venta?: Venta;
  productoId?: number;
  producto: Producto | null;
  cantidad: number;
  precio: number;
  subtotal: number;
}

export interface Venta {
  id?: number;
  cliente: Cliente | null;
  cajero: Cajero | null;
  fechaRegistro?: string;
  estado?: string;
  total?: number;
  metodoPago?: string;
  montoRecibido?: number;
  detalles?: DetalleVenta[];   // 🔥 Para mostrar items en cobro y mis-pedidos
}

// DTOs para crear una venta desde el frontend
export interface DetalleVentaRequest {
  productoId: number;
  cantidad: number;
}

export interface CrearVentaRequest {
  clienteId: number;
  cajeroId: number;
  productos: DetalleVentaRequest[];
}

export interface PedidoWhatsApp {
  id?: number;
  numeroRemitente: string;
  nombreRemitente?: string;
  tipo?: string;        // "PEDIDO" o "CONSULTA"
  mensaje: string;
  estado: string;       // NUEVO, PENDIENTE, EN_PROCESO, ATENDIDO
  respuesta?: string;
  fechaRegistro?: string;
  fechaAtencion?: string;
  ventaId?: number;
}
