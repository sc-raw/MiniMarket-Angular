package edu.pe.cibertec.dto;

import lombok.Data;
import java.util.List;

@Data
public class VentaWebDTO {
    private String dni;
    private String nombres;
    private String apellidos;
    private List<DetalleVentaRequest> productos;
}