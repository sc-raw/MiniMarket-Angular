package edu.pe.cibertec.dto;

import lombok.Data;

@Data
public class RegistroRequest {
    private String username;
    private String password;
    private String dni;
    private String nombres;
    private String apellidos;
}