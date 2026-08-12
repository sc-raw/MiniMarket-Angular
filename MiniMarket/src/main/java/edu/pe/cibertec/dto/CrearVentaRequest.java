package edu.pe.cibertec.dto;

import java.util.List;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CrearVentaRequest {

    private Long clienteId;
    private Long cajeroId;
    private List<DetalleVentaRequest> productos;
}
