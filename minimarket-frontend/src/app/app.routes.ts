import { Routes } from '@angular/router';
import { ClientesComponent } from './pages/clientes/clientes.component';
import { ProductosComponent } from './pages/productos/productos.component';
import { CajerosComponent } from './pages/cajeros/cajeros.component';
import { VentasComponent } from './pages/ventas/ventas.component';
import { InicioComponent } from './pages/inicio/inicio.component';
import { LoginComponent } from './pages/login/login.component';
import { ReportesComponent } from './pages/reportes/reportes.component';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: '', component: InicioComponent, title: 'MiniMarket - Inicio' },
  { path: 'login', component: LoginComponent, title: 'Login' },
  { path: 'clientes', component: ClientesComponent, title: 'Clientes', canActivate: [authGuard] },
  { path: 'productos', component: ProductosComponent, title: 'Productos', canActivate: [authGuard] },
  { path: 'cajeros', component: CajerosComponent, title: 'Cajeros', canActivate: [authGuard] },
  { path: 'ventas', component: VentasComponent, title: 'Ventas', canActivate: [authGuard] },
  { path: 'reportes', component: ReportesComponent, title: 'Reportes', canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
