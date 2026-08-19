import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

// Guard que protege rutas: solo deja pasar si hay sesión activa
// y el usuario NO es cliente (los clientes solo usan tienda / mis-pedidos)
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.estaAutenticado()) {
    // Si es cliente e intenta entrar al dashboard, lo mandamos a la tienda
    if (auth.esCliente()) {
      router.navigate(['/tienda']);
      return false;
    }
    return true; // Si es admin/cajero, deja entrar
  }
  router.navigate(['/login']);
  return false;
};

// Guard que solo deja pasar al ADMIN
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.esAdmin()) return true;
  router.navigate(['/']);
  return false;
};

// Guard para rutas que requieren ver clientes (admin, cajero, atencion)
export const clienteGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.puedeVerClientes()) return true;
  router.navigate(['/']);
  return false;
};

// Guard para rutas que requieren ver ventas (admin, cajero, atencion)
export const ventaGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.puedeVerVentas()) return true;
  router.navigate(['/']);
  return false;
};
