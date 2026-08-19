import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="container mt-5 d-flex justify-content-center">
      <div class="card shadow" style="width: 400px;">
        <div class="card-header text-white text-center" style="background:#2E7D32;">
          <h4 class="mt-2">Crear Cuenta de Cliente</h4>
        </div>
        <div class="card-body">
          @if (error()) {
            <div class="alert alert-danger">{{ error() }}</div>
          }
          @if (exito()) {
            <div class="alert alert-success">{{ exito() }}</div>
          }

          <form (ngSubmit)="registrar()">
            <div class="mb-3">
              <label class="form-label fw-bold">DNI</label>
              <input type="text" class="form-control" [(ngModel)]="dni" name="dni" required maxlength="8" pattern="[0-9]*" placeholder="Ej: 47200111">
            </div>
            <div class="mb-3">
              <label class="form-label fw-bold">Nombres</label>
              <input type="text" class="form-control" [(ngModel)]="nombres" name="nombres" required>
            </div>
            <div class="mb-3">
              <label class="form-label fw-bold">Apellidos</label>
              <input type="text" class="form-control" [(ngModel)]="apellidos" name="apellidos" required>
            </div>
            <div class="mb-3">
              <label class="form-label fw-bold">Usuario</label>
              <input type="text" class="form-control" [(ngModel)]="username" name="username" required>
            </div>
            <div class="mb-3">
              <label class="form-label fw-bold">Contraseña</label>
              <input type="password" class="form-control" [(ngModel)]="password" name="password" required minlength="4">
            </div>
            <button type="submit" class="btn btn-success w-100" [disabled]="cargando()">
              @if (cargando()) {
                <span class="spinner-border spinner-border-sm"></span>
              } @else {
                Registrarme
              }
            </button>
          </form>
          <hr>
          <p class="text-center mb-0">
            ¿Ya tienes cuenta? <a routerLink="/login">Iniciar sesión</a>
          </p>
        </div>
      </div>
    </div>
  `
})
export class RegistroComponent {
  private http = inject(HttpClient);
  private router = inject(Router);

  username = '';
  password = '';
  dni = '';
  nombres = '';
  apellidos = '';
  cargando = signal(false);
  error = signal('');
  exito = signal('');

  registrar() {
    this.cargando.set(true);
    this.error.set('');
    this.exito.set('');

    this.http.post('/api/auth/register', {
      username: this.username,
      password: this.password,
      dni: this.dni,
      nombres: this.nombres,
      apellidos: this.apellidos
    }, { responseType: 'text' }).subscribe({
      next: () => {
        this.cargando.set(false);
        this.exito.set('Registro exitoso. Redirigiendo al login...');
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.cargando.set(false);
        this.error.set(typeof err?.error === 'string' ? err.error : 'Error al registrar usuario.');
      }
    });
  }
}