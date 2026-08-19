package edu.pe.cibertec.dto;

import java.math.BigDecimal;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ConfirmarPagoRequest {

    private String metodoPago;
    private BigDecimal montoRecibido;
}