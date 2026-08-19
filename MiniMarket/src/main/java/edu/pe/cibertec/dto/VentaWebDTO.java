package edu.pe.cibertec.dto;

import lombok.Data;
import java.util.List;

@Data
public class VentaWebDTO {
    private String username;   // opcional: username del usuario CLIENTE logueado (para vincularle la Cliente)
    private String dni;
    private String nombres;
    private String apellidos;
    private List<DetalleVentaRequest> productos;
}