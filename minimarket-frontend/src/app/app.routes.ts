import { Routes } from '@angular/router';
import { ClientesComponent } from './pages/clientes/clientes.component';
import { ProductosComponent } from './pages/productos/productos.component';
import { EmpleadosComponent } from './pages/empleados/empleados.component';
import { VentasComponent } from './pages/ventas/ventas.component';
import { InicioComponent } from './pages/inicio/inicio.component';
import { LoginComponent } from './pages/login/login.component';
import { ReportesComponent } from './pages/reportes/reportes.component';
import { CategoriasComponent } from './pages/categorias/categorias.component';
import { PedidosWhatsAppComponent } from './pages/pedidos-whatsapp/pedidos-whatsapp.component';
import { authGuard, adminGuard, clienteGuard, ventaGuard } from './core/auth/auth.guard';
import { AuthService } from './core/auth/auth.service';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

// Guard que solo deja pasar a ATENCION_CLIENTE
const atencionGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.esAtencionCliente()) return true;
  router.navigate(['/']);
  return false;
};

export const routes: Routes = [
  { path: '', component: InicioComponent, title: 'MiniMarket - Inicio' },
  { path: 'login', component: LoginComponent, title: 'Login' },
  { path: 'registro', loadComponent: () => import('./pages/registro/registro.component').then(m => m.RegistroComponent), title: 'Registro' },
  { path: 'tienda', loadComponent: () => import('./pages/tienda/tienda.component').then(m => m.TiendaComponent) },
  { path: 'mis-pedidos', loadComponent: () => import('./pages/mis-pedidos/mis-pedidos.component').then(m => m.MisPedidosComponent), title: 'Mis Pedidos' },
  { path: 'productos', component: ProductosComponent, title: 'Productos', canActivate: [authGuard] },
  { path: 'clientes', component: ClientesComponent, title: 'Clientes', canActivate: [clienteGuard] },
  { path: 'categorias', component: CategoriasComponent, title: 'Categorías', canActivate: [adminGuard] },
  { path: 'empleados', component: EmpleadosComponent, title: 'Empleados', canActivate: [adminGuard] },
  { path: 'cajeros', redirectTo: 'empleados' },
  { path: 'ventas', component: VentasComponent, title: 'Ventas', canActivate: [ventaGuard] },
  { path: 'reportes', component: ReportesComponent, title: 'Reportes', canActivate: [authGuard] },
  // Nueva ruta para Atención al Cliente
  { path: 'pedidos-whatsapp', component: PedidosWhatsAppComponent, title: 'Pedidos WhatsApp', canActivate: [atencionGuard] },
  { path: '**', redirectTo: '' }
];
