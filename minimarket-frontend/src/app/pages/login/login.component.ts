import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container">
      <div class="row justify-content-center mt-5">
        <div class="col-md-5">
          <div class="card shadow-lg border-0">
            <div class="card-header text-center text-white" style="background:#2E7D32;">
              <h3 class="mt-2"><i class="bi bi-cart-fill"></i> MiniMarket</h3>
              <small>Sistema de Gestión de Ventas</small>
            </div>
            <div class="card-body p-4">
              @if (error()) {
                <div class="alert alert-danger">
                  <i class="bi bi-exclamation-triangle-fill"></i> {{ error() }}
                </div>
              }
              <form (ngSubmit)="login()">
                <div class="mb-3">
                  <label class="fw-bold">Usuario</label>
                  <input type="text"
                         class="form-control"
                         name="username"
                         [(ngModel)]="credentials.username"
                         required autofocus>
                </div>
                <div class="mb-4">
                  <label class="fw-bold">Contraseña</label>
                  <input type="password"
                         class="form-control"
                         name="password"
                         [(ngModel)]="credentials.password"
                         required>
                </div>
                <div class="d-grid">
                  <button type="submit" class="btn btn-success btn-lg" [disabled]="cargando()">
                    @if (cargando()) {
                      <span class="spinner-border spinner-border-sm"></span> Ingresando...
                    } @else {
                      Ingresar
                    }
                  </button>
                </div>
              </form>
            </div>
            <div class="card-footer text-center text-muted py-3" style="background:#f8f9fa;">
              <small>
                <strong>admin/admin123</strong> (ADMIN),
                <strong>cajero/cajero123</strong> (CAJERO),
                <strong>reponedor/reponedor123</strong> (REPONEDOR)
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  credentials = { username: '', password: '' };
  cargando = signal(false);
  error = signal('');

  login(): void {
    this.error.set('');
    this.cargando.set(true);
    this.auth.login(this.credentials).subscribe({
      next: (res) => {
        this.cargando.set(false);
        if (res.success) {
          this.router.navigate(['/']);
        } else {
          this.error.set(res.message || 'Error al iniciar sesión');
        }
      },
      error: () => {
        this.cargando.set(false);
        this.error.set('Usuario o contraseña incorrectos.');
      }
    });
  }
}
