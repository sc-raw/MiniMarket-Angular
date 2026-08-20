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

    private Long   empleadoId;   
    private String nombre;       
    private String apellidos;    

    private Long   clienteId;    
    private String dni;          

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
