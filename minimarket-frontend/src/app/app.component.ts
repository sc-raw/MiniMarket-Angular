import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './layout/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-navbar />
    <main class="py-4">
      <router-outlet />
    </main>
    <footer class="text-center text-white p-3 mt-5" style="background:#2E7D32;">
      <strong>MiniMarket</strong> — Sistema de Gestión de Ventas
      <br>© 2026 - Cibertec
    </footer>
  `
})
export class AppComponent {
  title = 'minimarket-frontend';
}
