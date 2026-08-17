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

    public LoginResponse(boolean success, String message, String username, String rol) {
        this.success = success;
        this.message = message;
        this.username = username;
        this.rol = rol;
    }
}
