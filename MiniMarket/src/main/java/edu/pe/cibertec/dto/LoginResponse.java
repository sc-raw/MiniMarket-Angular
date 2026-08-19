package edu.pe.cibertec.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class LoginResponse {
    private boolean success;
    private String message;
    private String username;
    private String rol;

    // ===== Datos de la persona vinculada (cajero o reponedor) =====
    // null cuando el usuario es admin o atencion_cliente (no tiene persona)
    private Long   empleadoId;   // cajero.id o reponedor.id
    private String nombre;       // p.ej. "Juan Carlos"
    private String apellidos;    // p.ej. "Perez Garcia"

    // ===== Datos del cliente =====
    // null cuando el usuario no es CLIENTE o aún no tiene una Cliente creada
    private Long   clienteId;    // cliente.id
    private String dni;          // cliente.dni

    public LoginResponse(boolean success, String message, String username, String rol) {
        this.success = success;
        this.message = message;
        this.username = username;
        this.rol = rol;
    }

    public LoginResponse(boolean success, String message, String username, String rol,
                         Long empleadoId, String nombre, String apellidos) {
        this.success = success;
        this.message = message;
        this.username = username;
        this.rol = rol;
        this.empleadoId = empleadoId;
        this.nombre = nombre;
        this.apellidos = apellidos;
    }

    public LoginResponse(boolean success, String message, String username, String rol,
                         Long empleadoId, String nombre, String apellidos,
                         Long clienteId) {
        this.success = success;
        this.message = message;
        this.username = username;
        this.rol = rol;
        this.empleadoId = empleadoId;
        this.nombre = nombre;
        this.apellidos = apellidos;
        this.clienteId = clienteId;
    }

    public LoginResponse(boolean success, String message, String username, String rol,
                         Long empleadoId, String nombre, String apellidos,
                         Long clienteId, String dni) {
        this.success = success;
        this.message = message;
        this.username = username;
        this.rol = rol;
        this.empleadoId = empleadoId;
        this.nombre = nombre;
        this.apellidos = apellidos;
        this.clienteId = clienteId;
        this.dni = dni;
    }
}
