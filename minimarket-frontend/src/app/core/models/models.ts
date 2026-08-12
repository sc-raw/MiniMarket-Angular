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

export interface DetalleVenta {
  id?: number;
  venta?: Venta;
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
