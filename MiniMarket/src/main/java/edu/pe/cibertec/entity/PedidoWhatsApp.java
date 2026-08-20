package edu.pe.cibertec.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "pedido_whatsapp")
@Getter
@Setter
@NoArgsConstructor
public class PedidoWhatsApp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 20, nullable = false)
    private String numeroRemitente;

    @Column(length = 100)
    private String nombreRemitente;

    @Column(length = 20)
    private String tipo;

    @Column(length = 500, nullable = false)
    private String mensaje;

    @Column(length = 20, nullable = false)
    private String estado = "NUEVO";

    @Column(length = 500)
    private String respuesta;

    @Column(nullable = false)
    private LocalDateTime fechaRegistro = LocalDateTime.now();

    @Column
    private LocalDateTime fechaAtencion;

    @Column
    private Long ventaId;
}
