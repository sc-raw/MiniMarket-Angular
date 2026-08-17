package edu.pe.cibertec.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class DetalleVentaRequest {

    private Integer productoId;
    private Integer cantidad;
}
