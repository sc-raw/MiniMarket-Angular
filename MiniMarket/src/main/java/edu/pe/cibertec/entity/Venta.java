package edu.pe.cibertec.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "venta")
@Getter
@Setter
@NoArgsConstructor
public class Venta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @ManyToOne
    @JoinColumn(name = "cajero_id", nullable = false)
    private Cajero cajero;

    @Column(nullable = false)
    private LocalDateTime fechaRegistro = LocalDateTime.now();

    @Column(length = 20, nullable = false)
    private String estado = "PENDIENTE";

    // Método de pago (EFECTIVO / YAPE / PLIN / SIP)
    // se llena al confirmar el pago en la simulación
    @Column(length = 20)
    private String metodoPago;

    // Monto con el que pagó el cliente (efectivo) — para calcular vuelto
    @Column(precision = 10, scale = 2)
    private BigDecimal montoRecibido = BigDecimal.ZERO;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal total = BigDecimal.ZERO;
}
